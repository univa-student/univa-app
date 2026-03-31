<?php

namespace App\Modules\Organizer\Policies;

use App\Models\User;
use App\Modules\Organizer\Models\Task;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }
}
