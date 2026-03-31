<?php

namespace App\Modules\User\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\User\Models\Friendship;
use App\Modules\User\Support\FriendshipBroadcaster;
class RemoveFriendship
{
    public function __construct(
        private readonly FriendshipBroadcaster $broadcaster,
    ) {
    }

    public function execute(User $user, User $otherUser): void
    {
        $friendship = Friendship::with(['sender', 'receiver'])
            ->where(function ($query) use ($user, $otherUser) {
                $query->where('user_id', $user->id)->where('friend_id', $otherUser->id);
            })
            ->orWhere(function ($query) use ($user, $otherUser) {
                $query->where('user_id', $otherUser->id)->where('friend_id', $user->id);
            })
            ->first();

        if (! $friendship) {
            throw new UnivaHttpException('Дружбу або запит не знайдено.', ResponseState::NotFound);
        }

        $friendship->delete();

        $this->broadcaster->broadcastRemoved(
            $friendship->sender,
            $friendship->receiver,
            $user->id,
        );
    }
}
