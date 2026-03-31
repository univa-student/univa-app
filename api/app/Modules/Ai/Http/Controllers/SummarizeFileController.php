<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Http\Requests\DeleteFileSummaryRequest;
use App\Modules\Ai\Http\Requests\GenerateSummaryRequest;
use App\Modules\Ai\Http\Requests\IndexFileSummariesRequest;
use App\Modules\Ai\Http\Requests\ShowFileSummaryRequest;
use App\Modules\Ai\Http\Requests\SummarizeFileRequest;
use App\Modules\Ai\Http\Resources\AiArtifactResource;
use App\Modules\Ai\Http\Resources\AiRunResource;
use App\Modules\Ai\Models\AiArtifact;
use App\Modules\Ai\UseCases\SummarizeFile;
use App\Modules\Files\Models\File;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Support\Notifier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Throwable;

class SummarizeFileController extends Controller
{
    public function index(IndexFileSummariesRequest $request): JsonResponse
    {
        $query = AiArtifact::query()
            ->with('run')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('type', AiArtifactType::SUMMARY->value)
            ->latest('id');

        if ($request->fileId() !== null) {
            $query->where('source_context_type', new File()->getMorphClass())
                ->where('source_context_id', $request->fileId());
        }

        if ($request->sessionId() !== null) {
            $query->whereHas('run', function (Builder $builder) use ($request): void {
                $builder->where('session_id', $request->sessionId());
            });
        }

        $artifacts = $query
            ->paginate($request->perPage())
            ->appends($request->query());

        return ApiResponse::make(
            state: ResponseState::OK,
            data: AiArtifactResource::collection($artifacts),
        );
    }

    /**
     * @throws Throwable
     */
    public function store(
        SummarizeFileRequest $request,
        SummarizeFile $useCase,
    ): JsonResponse {
        return $this->handleGeneration(
            request: $request,
            useCase: $useCase,
            successMessage: 'Конспект файлу успішно сформовано.',
            notificationMessage: 'Новий AI-матеріал для вашого файлу успішно згенеровано.',
        );
    }

    /**
     * @throws Throwable
     */
    public function storeMany(
        GenerateSummaryRequest $request,
        SummarizeFile $useCase,
    ): JsonResponse {
        return $this->handleGeneration(
            request: $request,
            useCase: $useCase,
            successMessage: 'Зведений AI-матеріал успішно сформовано.',
            notificationMessage: 'Новий AI-матеріал на основі кількох файлів успішно згенеровано.',
        );
    }

    public function show(ShowFileSummaryRequest $request): JsonResponse
    {
        $artifact = $request->artifact();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: new AiArtifactResource($artifact),
        );
    }

    public function destroy(DeleteFileSummaryRequest $request): JsonResponse
    {
        $artifact = $request->artifact();
        $artifact->delete();

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Конспект файлу успішно видалено.',
        );
    }

    /**
     * @throws Throwable
     */
    private function handleGeneration(
        SummarizeFileRequest|GenerateSummaryRequest $request,
        SummarizeFile $useCase,
        string $successMessage,
        string $notificationMessage,
    ): JsonResponse {
        $result = $useCase->handle($request->toDto());

        Notifier::send($request->user()->id, NotificationType::AI_SUMMARY_CREATED, [
            'message' => $notificationMessage,
        ]);

        return ApiResponse::make(
            state: ResponseState::OK,
            message: $successMessage,
            data: [
                'run' => isset($result['run'])
                    ? new AiRunResource($result['run'])
                    : null,
                'artifact' => new AiArtifactResource($result['artifact']),
            ],
        );
    }
}
