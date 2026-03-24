<?php

namespace App\Modules\Deadlines\Policies;

use App\Modules\Deadlines\Models\Deadline;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DeadlinePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Deadline $deadline): bool
    {
        return $user->id === $deadline->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Deadline $deadline): bool
    {
        return $user->id === $deadline->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Deadline $deadline): bool
    {
        return $user->id === $deadline->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Deadline $deadline): bool
    {
        return $user->id === $deadline->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Deadline $deadline): bool
    {
        return $user->id === $deadline->user_id;
    }
}
