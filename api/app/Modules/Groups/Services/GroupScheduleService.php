<?php

namespace App\Modules\Groups\Services;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Groups\Models\Group;
use App\Modules\Groups\Models\GroupExamEvent;
use App\Modules\Groups\Models\GroupScheduleLesson;
use App\Modules\Groups\Models\GroupScheduleLessonException;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class GroupScheduleService
{
    public function buildForRange(Group $group, Carbon $from, Carbon $to): array
    {
        $lessons = GroupScheduleLesson::query()
            ->where('group_id', $group->id)
            ->where('active_from', '<=', $to->toDateString())
            ->where(function ($query) use ($from) {
                $query->whereNull('active_to')
                    ->orWhere('active_to', '>=', $from->toDateString());
            })
            ->with([
                'subject',
                'lessonType',
                'deliveryMode',
                'recurrenceRule',
                'exceptions' => fn ($query) => $query->whereBetween('date', [$from->toDateString(), $to->toDateString()]),
            ])
            ->get();

        $instances = [];

        foreach ($lessons as $lesson) {
            $exceptions = $lesson->exceptions->keyBy(fn ($item) => $item->date->toDateString());

            foreach (CarbonPeriod::create($from, $to) as $day) {
                if (! $this->occursOn($lesson, $day)) {
                    continue;
                }

                $date = $day->toDateString();
                $exception = $exceptions->get($date);

                if ($exception !== null && $exception->action === 'cancelled') {
                    continue;
                }

                $instances[] = $this->buildInstance($lesson, $day, $exception);
            }
        }

        $exams = GroupExamEvent::query()
            ->where('group_id', $group->id)
            ->whereBetween('starts_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->with(['subject', 'examType'])
            ->get()
            ->map(function (GroupExamEvent $exam): array {
                return [
                    'id' => $exam->id,
                    'lesson_id' => null,
                    'date' => $exam->starts_at->toDateString(),
                    'starts_at' => $exam->starts_at->format('H:i'),
                    'ends_at' => $exam->ends_at?->format('H:i'),
                    'subject' => $this->formatSubject($exam->subject),
                    'exam_type' => [
                        'id' => $exam->examType->id,
                        'code' => $exam->examType->code,
                        'name' => $exam->examType->name,
                    ],
                    'lesson_type' => null,
                    'delivery_mode' => null,
                    'location' => $exam->location_text,
                    'note' => $exam->note,
                    'source' => 'exam',
                ];
            })
            ->all();

        $all = array_merge($instances, $exams);

        usort($all, fn (array $left, array $right) => strcmp($left['date'].$left['starts_at'], $right['date'].$right['starts_at']));

        return $all;
    }

    public function storeLesson(Group $group, array $data): GroupScheduleLesson
    {
        $this->assertNoConflict($group, $data);

        return GroupScheduleLesson::query()->create(array_merge($data, ['group_id' => $group->id]));
    }

    public function updateLesson(GroupScheduleLesson $lesson, array $data): GroupScheduleLesson
    {
        $merged = array_merge($lesson->toArray(), $data);
        $this->assertNoConflict($lesson->group, $merged, $lesson->id);
        $lesson->update($data);

        return $lesson->fresh(['subject', 'lessonType', 'deliveryMode', 'recurrenceRule']);
    }

    public function storeException(GroupScheduleLesson $lesson, array $data): GroupScheduleLessonException
    {
        $existing = GroupScheduleLessonException::query()
            ->where('group_schedule_lesson_id', $lesson->id)
            ->where('date', $data['date'])
            ->exists();

        if ($existing) {
            throw new UnivaHttpException('Виняток для цієї дати вже існує.', ResponseState::Unprocessable);
        }

        return GroupScheduleLessonException::query()->create(array_merge(
            $data,
            ['group_schedule_lesson_id' => $lesson->id]
        ));
    }

    private function occursOn(GroupScheduleLesson $lesson, Carbon $day): bool
    {
        if ($lesson->weekday !== $day->isoWeekday()) {
            return false;
        }

        if ($day->lt($lesson->active_from)) {
            return false;
        }

        if ($lesson->active_to !== null && $day->gt($lesson->active_to)) {
            return false;
        }

        $rule = $lesson->recurrenceRule->code;

        return match ($rule) {
            'weekly' => true,
            'biweekly_even' => $day->weekOfYear % 2 === 0,
            'biweekly_odd' => $day->weekOfYear % 2 !== 0,
            default => true,
        };
    }

    private function buildInstance(GroupScheduleLesson $lesson, Carbon $day, ?GroupScheduleLessonException $exception): array
    {
        $subject = $exception?->overrideSubject ?? $lesson->subject;

        if ($exception !== null && in_array($exception->action, ['rescheduled', 'modified'], true)) {
            return [
                'id' => $exception->id,
                'lesson_id' => $lesson->id,
                'date' => $day->toDateString(),
                'starts_at' => $exception->override_starts_at ?? $lesson->starts_at,
                'ends_at' => $exception->override_ends_at ?? $lesson->ends_at,
                'subject' => $this->formatSubject($subject),
                'lesson_type' => $this->formatLessonType($lesson),
                'delivery_mode' => $this->formatDeliveryMode($lesson),
                'location' => $exception->override_location_text ?? $lesson->location_text,
                'note' => $lesson->note,
                'source' => 'exception',
            ];
        }

        return [
            'id' => $lesson->id,
            'lesson_id' => $lesson->id,
            'date' => $day->toDateString(),
            'starts_at' => $lesson->starts_at,
            'ends_at' => $lesson->ends_at,
            'subject' => $this->formatSubject($lesson->subject),
            'lesson_type' => $this->formatLessonType($lesson),
            'delivery_mode' => $this->formatDeliveryMode($lesson),
            'location' => $lesson->location_text,
            'note' => $lesson->note,
            'source' => 'rule',
        ];
    }

    private function assertNoConflict(Group $group, array $data, ?int $excludeId = null): void
    {
        $query = GroupScheduleLesson::query()
            ->where('group_id', $group->id)
            ->where('weekday', $data['weekday'])
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            ->where('active_from', '<=', $data['active_to'] ?? '9999-12-31')
            ->where(function ($inner) use ($data) {
                $inner->whereNull('active_to')
                    ->orWhere('active_to', '>=', $data['active_from']);
            });

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new UnivaHttpException('Це заняття перетинається з іншим заняттям у той самий день.', ResponseState::Unprocessable);
        }
    }

    private function formatSubject($subject): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'teacher_name' => $subject->teacher_name,
            'color' => $subject->color,
        ];
    }

    private function formatLessonType(GroupScheduleLesson $lesson): array
    {
        return [
            'id' => $lesson->lessonType->id,
            'code' => $lesson->lessonType->code,
            'name' => $lesson->lessonType->name,
            'color' => $lesson->lessonType->color,
        ];
    }

    private function formatDeliveryMode(GroupScheduleLesson $lesson): array
    {
        return [
            'id' => $lesson->deliveryMode->id,
            'code' => $lesson->deliveryMode->code,
            'name' => $lesson->deliveryMode->name,
        ];
    }
}
