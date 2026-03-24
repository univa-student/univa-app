<?php

namespace App\Modules\Notification\UseCases;

use App\Modules\Notification\Contracts\NotificationUseCaseContract;
use App\Modules\Notification\DTO\SendNotificationData;
use App\Modules\Notification\Events\NotificationCreated;
use App\Modules\Notification\Models\Notification;

class SendNotification implements NotificationUseCaseContract
{
    public function handle(SendNotificationData $data): Notification
    {
        $notification = Notification::create($data->toArray());

        // Dispatch broadcasting event
        NotificationCreated::dispatch(
            $notification->user_id,
            $notification->id,
            $notification->type,
            $notification->payload
        );

        return $notification;
    }
}
