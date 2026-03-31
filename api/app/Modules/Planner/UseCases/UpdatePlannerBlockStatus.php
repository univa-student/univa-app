<?php

namespace App\Modules\Planner\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Events\PlannerBlockCompleted;
use App\Modules\Planner\Events\PlannerBlockUpdated;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Planner\Services\PlannerSourceSyncService;

class UpdatePlannerBlockStatus
{
    public function __construct(
        private readonly PlannerSourceSyncService $sourceSyncService,
    ) {}

    public function handle(PlannerBlock $block, array $data): PlannerBlock
    {
        if (isset($data['actual_minutes']) && (int) $data['actual_minutes'] < 0) {
            throw new UnivaHttpException('actual_minutes не може бути від’ємним.', ResponseState::Unprocessable);
        }

        $block->update([
            'status' => $data['status'],
            'actual_minutes' => $data['actual_minutes'] ?? $block->actual_minutes,
        ]);

        $block->load(['subject', 'task', 'deadline']);
        $this->sourceSyncService->syncForBlock($block);
        event(new PlannerBlockUpdated($block));

        if ($block->status === PlannerBlockStatus::COMPLETED) {
            event(new PlannerBlockCompleted($block));
        }

        return $block;
    }
}
