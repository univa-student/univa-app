<?php

namespace App\Http\Controllers\Schedule;

use App\Core\Response\ApiResponse;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\StoreExamEventRequest;
use App\Http\Requests\Schedule\UpdateExamEventRequest;
use App\Http\Requests\Schedule\IndexExamEventRequest;
use App\Models\Schedule\ExamEvent;
use App\Services\Schedule\ExamEventService;
use App\Http\Resources\Schedule\ExamEventResource;
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

        return ApiResponse::ok('Exam updated.', $updated);
    }

    public function destroy(ExamEvent $exam): JsonResponse
    {
        $this->authorize('delete', $exam);

        $this->service->delete($exam);

        return ApiResponse::ok('Exam deleted.');
    }
}
