<?php

namespace App\Modules\Planner\UseCases;

use App\Models\User;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Enums\PlannerBlockType;

class CreatePlannerBlocksFromTask
{
    public function __construct(
        private readonly CreatePlannerBlock $createPlannerBlock,
    ) {}

    public function handle(User $user, Task $task, array $data): array
    {
        return $this->createPlannerBlock->handle($user, array_merge($data, [
            'title' => $data['title'] ?? $task->title,
            'description' => $data['description'] ?? $task->description,
            'task_id' => $task->id,
            'type' => PlannerBlockType::TASK->value,
        ]));
    }
}
