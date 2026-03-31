<?php

namespace App\Modules\Planner\UseCases;

use App\Modules\Planner\Events\PlannerBlockDeleted;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerSourceSyncService;

class DeletePlannerBlock
{
    public function __construct(
        private readonly PlannerSourceSyncService $sourceSyncService,
    ) {}

    public function handle(PlannerBlock $block): void
    {
        $taskId = $block->task_id;
        $deadlineId = $block->deadline_id;
        $snapshot = clone $block;

        $block->delete();

        $this->sourceSyncService->syncTask($taskId);
        $this->sourceSyncService->syncDeadline($deadlineId);
        event(new PlannerBlockDeleted($snapshot));
    }
}
