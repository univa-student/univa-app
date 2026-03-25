<?php

namespace App\Modules\User\UseCases;

use App\Models\User;
use App\Modules\User\Models\Friendship;
use App\Modules\User\Support\FriendshipBroadcaster;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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

        if (!$friendship) {
            throw new NotFoundHttpException('Friendship or request not found.');
        }

        $friendship->delete();

        $this->broadcaster->broadcastRemoved(
            $friendship->sender,
            $friendship->receiver,
            $user->id,
        );
    }
}
