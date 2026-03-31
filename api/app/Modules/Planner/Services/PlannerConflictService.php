<?php

namespace App\Modules\Planner\Services;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;

class PlannerConflictService
{
    public function __construct(
        private readonly ScheduleService $scheduleService,
    ) {}

    public function validateAndCollect(
        int $userId,
        Carbon $startAt,
        Carbon $endAt,
        ?int $excludeBlockId = null,
        bool $allowLessonConflict = false,
    ): array {
        $plannerConflicts = PlannerBlock::query()
            ->ownedBy($userId)
            ->where('status', '!=', PlannerBlockStatus::CANCELED->value)
            ->where('start_at', '<', $endAt->toDateTimeString())
            ->where('end_at', '>', $startAt->toDateTimeString())
            ->when($excludeBlockId !== null, fn ($query) => $query->where('id', '!=', $excludeBlockId))
            ->get(['id', 'title', 'start_at', 'end_at', 'type', 'status'])
            ->map(fn (PlannerBlock $block): array => [
                'kind' => 'planner_block',
                'id' => $block->id,
                'title' => $block->title,
                'type' => $block->type?->value,
                'status' => $block->status?->value,
                'start_at' => $block->start_at?->toISOString(),
                'end_at' => $block->end_at?->toISOString(),
            ])
            ->values()
            ->all();

        if ($plannerConflicts !== []) {
            throw new UnivaHttpException(
                'Блок перетинається з іншим planner block.',
                ResponseState::Unprocessable,
                ['conflicts' => $plannerConflicts],
            );
        }

        $lessons = $this->scheduleService->buildForRange(
            $userId,
            $startAt->copy()->startOfDay(),
            $startAt->copy()->endOfDay(),
        );

        $lessonConflicts = [];

        foreach ($lessons as $lesson) {
            $lessonStart = Carbon::parse($lesson['date'] . ' ' . $lesson['starts_at']);
            $lessonEnd = $lesson['ends_at'] !== null
                ? Carbon::parse($lesson['date'] . ' ' . $lesson['ends_at'])
                : $lessonStart->copy()->addMinutes(90);

            if ($lessonStart->lt($endAt) && $lessonEnd->gt($startAt)) {
                $lessonConflicts[] = [
                    'kind' => 'lesson',
                    'id' => $lesson['id'],
                    'lesson_id' => $lesson['lesson_id'],
                    'title' => $lesson['subject']['name'] ?? 'Заняття',
                    'start_at' => $lessonStart->toISOString(),
                    'end_at' => $lessonEnd->toISOString(),
                    'source' => $lesson['source'],
                    'subject' => [
                        'id' => $lesson['subject']['id'] ?? null,
                        'name' => $lesson['subject']['name'] ?? null,
                        'color' => $lesson['subject']['color'] ?? null,
                    ],
                ];
            }
        }

        if ($lessonConflicts !== [] && ! $allowLessonConflict) {
            throw new UnivaHttpException(
                'Блок конфліктує із заняттям. Підтвердіть конфлікт явно.',
                ResponseState::Unprocessable,
                ['lesson_conflicts' => $lessonConflicts],
            );
        }

        return [
            'planner_conflicts' => [],
            'lesson_conflicts' => $lessonConflicts,
        ];
    }
}
