<?php

namespace App\Modules\Planner\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Events\PlannerBlockUpdated;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerConflictService;
use App\Modules\Planner\Services\PlannerSourceSyncService;
use Illuminate\Support\Facades\DB;

class UpdatePlannerBlock
{
    public function __construct(
        private readonly CreatePlannerBlock $createPlannerBlock,
        private readonly PlannerConflictService $conflictService,
        private readonly PlannerSourceSyncService $sourceSyncService,
    ) {}

    public function handle(PlannerBlock $block, array $data): array
    {
        if ($block->status === PlannerBlockStatus::COMPLETED) {
            throw new UnivaHttpException(
                'Завершений block не можна редагувати без явного reset статусу.',
                ResponseState::Unprocessable,
            );
        }

        return DB::transaction(function () use ($block, $data): array {
            $beforeTaskId = $block->task_id;
            $beforeDeadlineId = $block->deadline_id;

            $prepared = $this->createPlannerBlock->prepareData(
                $block->user_id,
                array_merge($block->toArray(), $data),
            );

            $conflicts = $this->conflictService->validateAndCollect(
                $block->user_id,
                $prepared['start_at'],
                $prepared['end_at'],
                $block->id,
                (bool) ($data['allow_lesson_conflict'] ?? false),
            );

            $block->update($prepared);
            $block->load(['subject', 'task', 'deadline']);

            $this->sourceSyncService->syncTask($beforeTaskId);
            $this->sourceSyncService->syncDeadline($beforeDeadlineId);
            $this->sourceSyncService->syncForBlock($block);
            event(new PlannerBlockUpdated($block));

            return [
                'block' => $block,
                'meta' => $conflicts['lesson_conflicts'] === [] ? [] : ['conflicts' => $conflicts['lesson_conflicts']],
            ];
        });
    }
}
