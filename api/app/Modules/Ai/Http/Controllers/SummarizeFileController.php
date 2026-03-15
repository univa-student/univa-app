<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Ai\Http\Requests\SummarizeFileRequest;
use App\Modules\Ai\Http\Resources\AiArtifactResource;
use App\Modules\Ai\Http\Resources\AiRunResource;
use App\Modules\Ai\UseCases\SummarizeFile;
use Illuminate\Http\JsonResponse;
use Throwable;

class SummarizeFileController extends Controller
{
    /**
     * Створити конспект для файла через AI.
     *
     * @throws Throwable
     */
    public function store(
        SummarizeFileRequest $request,
        SummarizeFile $useCase,
    ): JsonResponse {
        $result = $useCase->handle($request->toDto());

        return ApiResponse::make(
            state: ResponseState::OK,
            message: 'Конспект файла успішно сформовано.',
            data: [
                'run' => isset($result['run'])
                    ? new AiRunResource($result['run'])
                    : null,
                'artifact' => new AiArtifactResource($result['artifact']),
            ]
        );
    }
}
