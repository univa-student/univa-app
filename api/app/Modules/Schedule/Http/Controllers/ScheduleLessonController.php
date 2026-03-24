<?php

namespace App\Modules\Schedule\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Schedule\Http\Requests\StoreScheduleLessonRequest;
use App\Modules\Schedule\Http\Requests\UpdateScheduleLessonRequest;
use App\Modules\Schedule\Models\ScheduleLesson;
use App\Modules\Schedule\Services\ScheduleService;
use App\Modules\Schedule\Http\Resources\ScheduleLessonResource;
use App\Modules\Files\Http\Resources\FileResource;
use Illuminate\Http\JsonResponse;

class ScheduleLessonController extends Controller
{
    public function __construct(
        private readonly ScheduleService $service,
    ) {}

    public function show(ScheduleLesson $lesson): JsonResponse
    {
        $lesson->load(['subject', 'lessonType', 'deliveryMode', 'recurrenceRule']);

        return ApiResponse::data(new ScheduleLessonResource($lesson));
    }

    public function materials(ScheduleLesson $lesson): JsonResponse
    {
        $subject = clone $lesson->subject;
        $subject->load('files');

        return ApiResponse::data(FileResource::collection($subject->files));
    }

    public function store(StoreScheduleLessonRequest $request): JsonResponse
    {
        try {
            $lesson = $this->service->storeLesson(
                (int) auth()->id(),
                $request->validated()
            );
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        $lesson->load(['subject', 'lessonType', 'deliveryMode', 'recurrenceRule']);

        return ApiResponse::created('Lesson created.', $lesson);
    }

    public function update(UpdateScheduleLessonRequest $request, ScheduleLesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson);

        try {
            $updated = $this->service->updateLesson($lesson, $request->validated());
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        return ApiResponse::ok('Lesson updated.', $updated);
    }

    public function destroy(ScheduleLesson $lesson): JsonResponse
    {
        $this->authorize('delete', $lesson);

        $lesson->delete();

        return ApiResponse::ok('Lesson deleted.');
    }
}
