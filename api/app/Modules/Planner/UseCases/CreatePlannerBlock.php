<?php

namespace App\Modules\Planner\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Enums\PlannerSourceType;
use App\Modules\Planner\Events\PlannerBlockCreated;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerConflictService;
use App\Modules\Planner\Services\PlannerOwnershipService;
use App\Modules\Planner\Services\PlannerSourceSyncService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreatePlannerBlock
{
    public function __construct(
        private readonly PlannerOwnershipService $ownershipService,
        private readonly PlannerConflictService $conflictService,
        private readonly PlannerSourceSyncService $sourceSyncService,
    ) {}

    public function handle(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data): array {
            $prepared = $this->prepareData($user->id, $data);

            $conflicts = $this->conflictService->validateAndCollect(
                $user->id,
                $prepared['start_at'],
                $prepared['end_at'],
                null,
                (bool) ($data['allow_lesson_conflict'] ?? false),
            );

            $block = PlannerBlock::query()->create(array_merge($prepared, [
                'user_id' => $user->id,
            ]));

            $block->load(['subject', 'task', 'deadline']);
            $this->sourceSyncService->syncForBlock($block);
            event(new PlannerBlockCreated($block));

            return [
                'block' => $block,
                'meta' => $conflicts['lesson_conflicts'] === [] ? [] : ['conflicts' => $conflicts['lesson_conflicts']],
            ];
        });
    }

    public function prepareData(int $userId, array $data): array
    {
        $task = $this->ownershipService->getOwnedTask($userId, $data['task_id'] ?? null);
        $deadline = $this->ownershipService->getOwnedDeadline($userId, $data['deadline_id'] ?? null);
        $subject = $this->ownershipService->getOwnedSubject($userId, $data['subject_id'] ?? ($deadline?->subject_id));
        $scheduleLesson = $this->ownershipService->getOwnedScheduleLesson($userId, $data['schedule_lesson_id'] ?? null);

        if ($task instanceof Task && $task->status === Task::STATUS_DONE) {
            throw new UnivaHttpException('Не можна створити planner block для завершеної задачі.', ResponseState::Unprocessable);
        }

        if ($deadline instanceof Deadline && $deadline->status === Deadline::STATUS_COMPLETED) {
            throw new UnivaHttpException('Не можна створити planner block для завершеного дедлайну.', ResponseState::Unprocessable);
        }

        $startAt = Carbon::parse($data['start_at']);
        $endAt = Carbon::parse($data['end_at']);

        if ($endAt->lte($startAt)) {
            throw new UnivaHttpException('Час завершення має бути пізніше за час початку.', ResponseState::Unprocessable);
        }

        if ($startAt->toDateString() !== $endAt->toDateString()) {
            throw new UnivaHttpException('Planner block не може перетинати межу дня в MVP.', ResponseState::Unprocessable);
        }

        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            $title = $task?->title ?? $deadline?->title ?? 'Planner block';
        }

        $type = $data['type'];
        $sourceType = null;
        $sourceId = null;

        if ($task instanceof Task) {
            $sourceType = PlannerSourceType::TASK->value;
            $sourceId = $task->id;
            $type = $type === PlannerBlockType::MANUAL->value ? PlannerBlockType::TASK->value : $type;
        } elseif ($deadline instanceof Deadline) {
            $sourceType = PlannerSourceType::DEADLINE->value;
            $sourceId = $deadline->id;
            $type = $type === PlannerBlockType::MANUAL->value ? PlannerBlockType::DEADLINE->value : $type;
        } elseif ($scheduleLesson !== null) {
            $sourceType = PlannerSourceType::LESSON->value;
            $sourceId = $scheduleLesson->id;
        }

        return [
            'title' => $title,
            'description' => $data['description'] ?? null,
            'type' => $type,
            'status' => $data['status'] ?? PlannerBlockStatus::PLANNED->value,
            'start_at' => $startAt,
            'end_at' => $endAt,
            'date' => $startAt->toDateString(),
            'is_all_day' => (bool) ($data['is_all_day'] ?? false),
            'is_locked' => (bool) ($data['is_locked'] ?? false),
            'created_by_ai' => (bool) ($data['created_by_ai'] ?? false),
            'color' => $data['color'] ?? $subject?->color,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'subject_id' => $subject?->id,
            'task_id' => $task?->id,
            'deadline_id' => $deadline?->id,
            'schedule_lesson_id' => $scheduleLesson?->id,
            'priority' => $data['priority'] ?? null,
            'estimated_minutes' => $data['estimated_minutes'] ?? (int) floor($endAt->diffInMinutes($startAt)),
            'actual_minutes' => $data['actual_minutes'] ?? null,
            'energy_level' => $data['energy_level'] ?? null,
            'meta' => $data['meta'] ?? null,
        ];
    }
}
