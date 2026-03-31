<?php

namespace App\Modules\Planner\Services;

use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Models\PlannerBlock;

class PlannerSourceSyncService
{
    public function syncForBlock(PlannerBlock $block): void
    {
        if ($block->task_id !== null) {
            $this->syncTask($block->task_id);
        }

        if ($block->deadline_id !== null) {
            $this->syncDeadline($block->deadline_id);
        }
    }

    public function syncTask(?int $taskId): void
    {
        if ($taskId === null) {
            return;
        }

        $task = Task::query()->find($taskId);
        if (! $task instanceof Task) {
            return;
        }

        $blocks = PlannerBlock::query()
            ->where('task_id', $taskId)
            ->whereNull('deleted_at')
            ->get(['status']);

        if ($blocks->isEmpty()) {
            return;
        }

        $nonCanceled = $blocks->filter(
            fn (PlannerBlock $block): bool => $block->status !== PlannerBlockStatus::CANCELED
        );

        if ($nonCanceled->isNotEmpty() && $nonCanceled->every(
            fn (PlannerBlock $block): bool => $block->status === PlannerBlockStatus::COMPLETED
        )) {
            $task->update([
                'status' => Task::STATUS_DONE,
                'completed_at' => now(),
            ]);

            return;
        }

        if ($nonCanceled->contains(fn (PlannerBlock $block): bool => in_array(
            $block->status,
            [PlannerBlockStatus::IN_PROGRESS, PlannerBlockStatus::COMPLETED],
            true,
        ))) {
            $task->update([
                'status' => Task::STATUS_IN_PROGRESS,
                'completed_at' => null,
            ]);

            return;
        }

        $task->update([
            'status' => Task::STATUS_TODO,
            'completed_at' => null,
        ]);
    }

    public function syncDeadline(?int $deadlineId): void
    {
        if ($deadlineId === null) {
            return;
        }

        $deadline = Deadline::query()->find($deadlineId);
        if (! $deadline instanceof Deadline) {
            return;
        }

        $blocks = PlannerBlock::query()
            ->where('deadline_id', $deadlineId)
            ->whereNull('deleted_at')
            ->get(['status']);

        if ($blocks->isEmpty()) {
            return;
        }

        $nonCanceled = $blocks->filter(
            fn (PlannerBlock $block): bool => $block->status !== PlannerBlockStatus::CANCELED
        );

        if ($nonCanceled->isNotEmpty() && $nonCanceled->every(
            fn (PlannerBlock $block): bool => $block->status === PlannerBlockStatus::COMPLETED
        )) {
            $deadline->update([
                'status' => Deadline::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            return;
        }

        if ($nonCanceled->contains(fn (PlannerBlock $block): bool => in_array(
            $block->status,
            [PlannerBlockStatus::IN_PROGRESS, PlannerBlockStatus::COMPLETED],
            true,
        ))) {
            $deadline->update([
                'status' => Deadline::STATUS_IN_PROGRESS,
                'completed_at' => null,
            ]);

            return;
        }

        $deadline->update([
            'status' => Deadline::STATUS_NEW,
            'completed_at' => null,
        ]);
    }
}
