<?php

namespace App\Modules\User\UseCases;

use App\Models\User;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Support\Notifier;
use App\Modules\User\Enums\FriendshipStatus;
use App\Modules\User\Models\Friendship;
use App\Modules\User\Support\FriendshipBroadcaster;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class SendFriendRequest
{
    public function __construct(
        private readonly FriendshipBroadcaster $broadcaster,
    ) {
    }

    public function execute(User $sender, User $receiver): Friendship
    {
        if ($sender->id === $receiver->id) {
            throw new BadRequestHttpException('Cannot send a friend request to yourself.');
        }

        $existing = Friendship::where(function ($query) use ($sender, $receiver) {
            $query->where('user_id', $sender->id)->where('friend_id', $receiver->id);
        })->orWhere(function ($query) use ($sender, $receiver) {
            $query->where('user_id', $receiver->id)->where('friend_id', $sender->id);
        })->first();

        if ($existing) {
            if ($existing->status === FriendshipStatus::ACCEPTED) {
                throw new ConflictHttpException('You are already friends with this user.');
            }

            if ($existing->user_id === $sender->id) {
                throw new ConflictHttpException('Friend request already sent.');
            }

            $existing->update(['status' => FriendshipStatus::ACCEPTED]);

            Notifier::send($receiver->id, NotificationType::FRIEND_ACCEPTED, [
                'message' => "{$sender->first_name} прийняв ваш запит у друзі.",
                'accepter_id' => $sender->id,
            ]);

            $existing->loadMissing(['sender', 'receiver']);
            $this->broadcaster->broadcastAccepted($existing, $sender->id);

            return $existing->fresh();
        }

        $friendship = Friendship::create([
            'user_id' => $sender->id,
            'friend_id' => $receiver->id,
            'status' => FriendshipStatus::PENDING,
        ]);

        Notifier::send($receiver->id, NotificationType::FRIEND_REQUEST, [
            'message' => "{$sender->first_name} хоче додати вас у друзі.",
            'sender_id' => $sender->id,
        ]);

        $friendship->loadMissing(['sender', 'receiver']);
        $this->broadcaster->broadcastRequestSent($friendship, $sender->id);

        return $friendship;
    }
}
