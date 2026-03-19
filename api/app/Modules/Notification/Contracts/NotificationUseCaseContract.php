<?php

namespace App\Modules\Notification\Contracts;

use App\Modules\Notification\DTO\SendNotificationData;
use App\Modules\Notification\Models\Notification;

interface NotificationUseCaseContract
{
    public function handle(SendNotificationData $data): Notification;
}
