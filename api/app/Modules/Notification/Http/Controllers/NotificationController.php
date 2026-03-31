<?php

namespace App\Modules\Notification\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Notification\Http\Resources\NotificationResource;
use App\Modules\Notification\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return NotificationResource::collection($notifications);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            throw new UnivaHttpException('Доступ заборонено.', ResponseState::Forbidden);
        }

        $notification->update(['read_at' => now()]);

        return ApiResponse::ok('Сповіщення позначено як "Прочитане"');
    }

    public function markAllAsRead(Request $request)
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ApiResponse::ok('Всі сповіщення позначені як "Прочитані"');
    }

    public function destroy(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            throw new UnivaHttpException('Доступ заборонено.', ResponseState::Forbidden);
        }

        $notification->delete();

        return ApiResponse::ok('Сповіщення видалено');
    }
}
