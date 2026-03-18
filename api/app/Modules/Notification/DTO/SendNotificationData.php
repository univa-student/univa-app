<?php

namespace App\Modules\Notification\DTO;

use App\Modules\Notification\Enums\NotificationType;

class SendNotificationData
{
    public function __construct(
        public int $userId,
        public string|NotificationType $type,
        public array $payload = []
    ) {}

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'type' => $this->type instanceof NotificationType ? $this->type->value : $this->type,
            'payload' => $this->payload,
        ];
    }
}
