<?php

namespace App\Modules\Schedule\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Schedule\Http\Requests\StoreExceptionRequest;
use App\Modules\Schedule\Models\ScheduleLesson;
use App\Modules\Schedule\Models\ScheduleLessonException;
use App\Modules\Schedule\Services\ScheduleService;
use App\Modules\Notification\Support\Notifier;
use App\Modules\Notification\Enums\NotificationType;
use Illuminate\Http\JsonResponse;

class ScheduleExceptionController extends Controller
{
    public function __construct(
        private readonly ScheduleService $service,
    ) {}

    public function store(StoreExceptionRequest $request, ScheduleLesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson);

        try {
            $exception = $this->service->storeException($lesson, $request->validated());
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        Notifier::send($lesson->user_id, NotificationType::SCHEDULE_EXCEPTION_CREATED, [
            'message' => "У розкладі відбулися зміни. Це стосується пари з предмету '{$lesson->subject?->name}'.",
            'lesson_id' => $lesson->id
        ]);

        return ApiResponse::created('Виняток створено.', $exception);
    }

    public function destroy(ScheduleLessonException $exception): JsonResponse
    {
        $this->authorize('update', $exception->lesson);

        $this->service->deleteException($exception);

        return ApiResponse::ok('Виняток видалено.');
    }
}
