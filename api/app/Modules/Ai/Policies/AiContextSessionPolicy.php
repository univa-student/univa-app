<?php

declare(strict_types=1);

namespace App\Modules\Ai\Policies;

use App\Models\User;
use App\Modules\Ai\Models\AiContextSession;

class AiContextSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->exists;
    }

    public function view(User $user, AiContextSession $session): bool
    {
        return (int) $session->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function update(User $user, AiContextSession $session): bool
    {
        return (int) $session->user_id === (int) $user->id;
    }

    public function delete(User $user, AiContextSession $session): bool
    {
        return (int) $session->user_id === (int) $user->id;
    }

    public function archive(User $user, AiContextSession $session): bool
    {
        return (int) $session->user_id === (int) $user->id;
    }

    public function createRun(User $user, AiContextSession $session): bool
    {
        if ((int) $session->user_id !== (int) $user->id) {
            return false;
        }

        return $session->canAcceptNewRuns();
    }
}
