<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreScheduleLessonRequest;
use App\Http\Requests\Schedule\UpdateScheduleLessonRequest;
use App\Models\Schedule\ScheduleLesson;
use App\Services\Schedule\ScheduleService;
use App\Http\Resources\Schedule\ScheduleLessonResource;
use App\Http\Resources\Files\FileResource;
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
