<?php

namespace App\Modules\User\UseCases;

use App\Models\User;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Support\Notifier;
use App\Modules\User\Enums\FriendshipStatus;
use App\Modules\User\Models\Friendship;
use App\Modules\User\Support\FriendshipBroadcaster;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AcceptFriendRequest
{
    public function __construct(
        private readonly FriendshipBroadcaster $broadcaster,
    ) {
    }

    public function execute(User $user, User $sender): Friendship
    {
        $friendship = Friendship::where('user_id', $sender->id)
            ->where('friend_id', $user->id)
            ->first();

        if (!$friendship) {
            throw new NotFoundHttpException('Friend request not found.');
        }

        if ($friendship->status === FriendshipStatus::ACCEPTED) {
            throw new ConflictHttpException('You are already friends.');
        }

        $friendship->update(['status' => FriendshipStatus::ACCEPTED]);

        Notifier::send($sender->id, NotificationType::FRIEND_ACCEPTED, [
            'message' => "{$user->first_name} прийняв ваш запит у друзі.",
            'accepter_id' => $user->id,
        ]);

        $friendship->loadMissing(['sender', 'receiver']);
        $this->broadcaster->broadcastAccepted($friendship, $user->id);

        return $friendship;
    }
}
