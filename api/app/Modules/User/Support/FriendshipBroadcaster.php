<?php

declare(strict_types=1);

namespace App\Modules\User\Support;

use App\Models\User;
use App\Modules\User\Events\FriendshipUpdated;
use App\Modules\User\Models\Friendship;

class FriendshipBroadcaster
{
    public function broadcastRequestSent(Friendship $friendship, int $actorId): void
    {
        $friendship->loadMissing(['sender', 'receiver']);

        $this->dispatchPair(
            firstUser: $friendship->sender,
            firstStatus: 'pending_sent',
            secondUser: $friendship->receiver,
            secondStatus: 'pending_received',
            action: 'request_sent',
            actorId: $actorId,
        );
    }

    public function broadcastAccepted(Friendship $friendship, int $actorId): void
    {
        $friendship->loadMissing(['sender', 'receiver']);

        $this->dispatchPair(
            firstUser: $friendship->sender,
            firstStatus: 'accepted',
            secondUser: $friendship->receiver,
            secondStatus: 'accepted',
            action: 'accepted',
            actorId: $actorId,
        );
    }

    public function broadcastRemoved(User $firstUser, User $secondUser, int $actorId): void
    {
        $this->dispatchPair(
            firstUser: $firstUser,
            firstStatus: 'none',
            secondUser: $secondUser,
            secondStatus: 'none',
            action: 'removed',
            actorId: $actorId,
        );
    }

    private function dispatchPair(
        User $firstUser,
        string $firstStatus,
        User $secondUser,
        string $secondStatus,
        string $action,
        int $actorId,
    ): void {
        FriendshipUpdated::dispatch(
            $firstUser->id,
            $action,
            $actorId,
            $secondUser->id,
            $firstStatus,
        );

        FriendshipUpdated::dispatch(
            $secondUser->id,
            $action,
            $actorId,
            $firstUser->id,
            $secondStatus,
        );
    }
}
