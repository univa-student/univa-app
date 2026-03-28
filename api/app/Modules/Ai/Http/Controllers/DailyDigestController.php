<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Http\Requests\LatestDailyDigestRequest;
use App\Modules\Ai\Http\Resources\AiArtifactResource;
use App\Modules\Ai\Models\AiArtifact;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DailyDigestController extends Controller
{
    public function latest(LatestDailyDigestRequest $request): JsonResponse
    {
        $query = AiArtifact::query()
            ->with('run')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('type', AiArtifactType::DAILY_DIGEST->value)
            ->latest('id');

        if ($request->getDate() !== null) {
            $date = Carbon::parse($request->getDate())->toDateString();

            $query->where(function ($builder) use ($date): void {
                $builder
                    ->where('content_json->meta->generated_for_date', $date)
                    ->orWhereDate('created_at', $date);
            });
        }

        $artifact = $query->first();

        return ApiResponse::make(
            state: ResponseState::OK,
            data: $artifact instanceof AiArtifact
                ? new AiArtifactResource($artifact)
                : null,
        );
    }
}
