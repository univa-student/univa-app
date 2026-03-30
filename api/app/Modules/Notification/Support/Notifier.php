<?php

namespace App\Modules\Notification\Support;

use App\Modules\Notification\DTO\SendNotificationData;
use App\Modules\Notification\UseCases\SendNotification;

use App\Modules\Notification\Enums\NotificationType;

class Notifier
{
    /**
     * Зручний статичний метод для відправки сповіщення.
     * Приклад виклику: Notifier::send($userId, 'lesson_started', ['lesson_id' => 123]);
     * @throws \Exception
     */
    public static function send(int $userId, string|NotificationType $type, array $payload = []): void
    {
        $data = new SendNotificationData($userId, $type, $payload);
        app(SendNotification::class)->handle($data);
    }
}
