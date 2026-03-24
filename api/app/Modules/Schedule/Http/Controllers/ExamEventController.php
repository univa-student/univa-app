<?php

namespace App\Modules\Schedule\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Schedule\Http\Requests\StoreExamEventRequest;
use App\Modules\Schedule\Http\Requests\UpdateExamEventRequest;
use App\Modules\Schedule\Http\Requests\IndexExamEventRequest;
use App\Modules\Schedule\Models\ExamEvent;
use App\Modules\Schedule\Services\ExamEventService;
use App\Modules\Schedule\Http\Resources\ExamEventResource;
use App\Modules\Notification\Support\Notifier;
use App\Modules\Notification\Enums\NotificationType;
use Illuminate\Http\JsonResponse;

class ExamEventController extends Controller
{
    public function __construct(
        private readonly ExamEventService $service,
    ) {}

    public function index(IndexExamEventRequest $request): JsonResponse
    {

        $exams = $this->service->listForUser(
            (int) auth()->id(),
            $request->query('from'),
            $request->query('to'),
        );

        return ApiResponse::data(ExamEventResource::collection($exams));
    }

    public function store(StoreExamEventRequest $request): JsonResponse
    {
        $exam = $this->service->create((int) auth()->id(), $request->validated());
        $exam->load(['subject', 'examType']);

        Notifier::send($exam->user_id, NotificationType::EXAM_CREATED, [
            'message' => "Заплановано новий екзамен: {$exam->subject?->name}.",
            'exam_id' => $exam->id
        ]);

        return ApiResponse::created('Exam created.', $exam);
    }

    public function update(UpdateExamEventRequest $request, ExamEvent $exam): JsonResponse
    {
        $this->authorize('update', $exam);

        try {
            $updated = $this->service->update($exam, $request->validated());
        } catch (UnivaHttpException $e) {
            return $e->render();
        }

        Notifier::send($updated->user_id, NotificationType::EXAM_UPDATED, [
            'message' => "Деталі екзамену з предмету '{$updated->subject?->name}' було оновлено.",
            'exam_id' => $updated->id
        ]);

        return ApiResponse::ok('Exam updated.', $updated);
    }

    public function destroy(ExamEvent $exam): JsonResponse
    {
        $this->authorize('delete', $exam);

        $this->service->delete($exam);

        return ApiResponse::ok('Exam deleted.');
    }
}
