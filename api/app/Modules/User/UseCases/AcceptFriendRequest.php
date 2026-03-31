<?php

namespace App\Modules\User\UseCases;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Support\Notifier;
use App\Modules\User\Enums\FriendshipStatus;
use App\Modules\User\Models\Friendship;
use App\Modules\User\Support\FriendshipBroadcaster;
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

        if (! $friendship) {
            throw new UnivaHttpException('Запит у друзі не знайдено.', ResponseState::NotFound);
        }

        if ($friendship->status === FriendshipStatus::ACCEPTED) {
            throw new UnivaHttpException('Ви вже є друзями.', ResponseState::Warning);
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
