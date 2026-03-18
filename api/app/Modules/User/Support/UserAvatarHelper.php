<?php

declare(strict_types=1);

namespace App\Modules\User\Support;

use App\Models\User;

class UserAvatarHelper
{
    /**
     * Отримує URL аватара або повертає дефолтний, якщо не встановлено.
     */
    public static function getAvatarUrl(User $user): ?string
    {
        if ($user->avatar_path !== null) {
            return asset('storage/' . $user->avatar_path);
        }

        // Default or generated avatar logic can go here.
        return null;
    }
}
