<?php

namespace App\Modules\Planner\Policies;

use App\Models\User;
use App\Modules\Planner\Models\PlannerBlock;

class PlannerBlockPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PlannerBlock $plannerBlock): bool
    {
        return $user->id === $plannerBlock->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PlannerBlock $plannerBlock): bool
    {
        return $user->id === $plannerBlock->user_id;
    }

    public function delete(User $user, PlannerBlock $plannerBlock): bool
    {
        return $user->id === $plannerBlock->user_id;
    }
}
