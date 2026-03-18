<?php

declare(strict_types=1);

namespace App\Modules\User\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $authUser, User $model): bool
    {
        return $authUser->is($model);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $authUser, User $model): bool
    {
        return $authUser->is($model);
    }
}
