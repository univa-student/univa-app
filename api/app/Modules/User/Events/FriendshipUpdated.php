<?php

declare(strict_types=1);

namespace App\Modules\User\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendshipUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $recipientUserId,
        public string $action,
        public int $actorId,
        public int $otherUserId,
        public string $friendshipStatus,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->recipientUserId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'actor_id' => $this->actorId,
            'other_user_id' => $this->otherUserId,
            'friendship_status' => $this->friendshipStatus,
        ];
    }

    public function broadcastAs(): string
    {
        return 'friendship.updated';
    }
}
