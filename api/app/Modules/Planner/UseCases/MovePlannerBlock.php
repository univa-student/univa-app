<?php

namespace App\Modules\Planner\UseCases;

use App\Modules\Planner\Models\PlannerBlock;

class MovePlannerBlock
{
    public function __construct(
        private readonly UpdatePlannerBlock $updatePlannerBlock,
    ) {}

    public function handle(PlannerBlock $block, array $data): array
    {
        return $this->updatePlannerBlock->handle($block, [
            'start_at' => $data['start_at'],
            'end_at' => $data['end_at'],
            'allow_lesson_conflict' => $data['allow_lesson_conflict'] ?? false,
        ]);
    }
}
