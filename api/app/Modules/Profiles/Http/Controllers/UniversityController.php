<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Http\Controllers\Controller;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Support\Notifier;
use App\Modules\Profiles\Enums\Course;
use App\Modules\Profiles\Enums\RegionCode;
use App\Modules\Profiles\Exceptions\GetUniversityException;
use App\Modules\Profiles\Http\Requests\SelectRegionRequest;
use App\Modules\Profiles\Http\Requests\SelectUniversityRequest;
use App\Modules\Profiles\Http\Requests\StoreSelectUniversityRequest;
use App\Modules\Profiles\Http\Resources\ProfileResource;
use App\Modules\Profiles\Http\Resources\UniversityResource;
use App\Modules\Profiles\Services\ProfileService;
use App\Modules\Profiles\Support\UniversitiesByRegion;
use App\Modules\Profiles\UseCases\RemoveUniversity;
use App\Modules\Profiles\UseCases\SaveUniversity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use JsonException;
use Saloon\Exceptions\Request\FatalRequestException;
use Saloon\Exceptions\Request\RequestException;

class UniversityController extends Controller
{
    public function information(): JsonResponse
    {
        return ApiResponse::make(
            state: ResponseState::OK,
            data: [
                'regions' => RegionCode::options(),
                'courses' => Course::options(),
            ],
        );
    }

    /**
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     * @throws GetUniversityException
     */
    public function selectRegion(SelectRegionRequest $request): JsonResponse
    {
        $code = $request->toDto()->regionCode->value;

        $universities = app(UniversitiesByRegion::class)
            ->getByRegion($code);

        return ApiResponse::make(
            state: ResponseState::OK,
            data: $universities,
        );
    }

    /**
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     * @throws GetUniversityException
     */
    public function selectUniversity(SelectUniversityRequest $request): JsonResponse
    {
        $id = $request->toDto()->universityId;

        $university = app(UniversitiesByRegion::class)
            ->getByUniversityId($id);

        return ApiResponse::make(
            state: ResponseState::OK,
            data: $university,
        );
    }

    public function current(Request $request, ProfileService $profiles): JsonResponse
    {
        $university = $profiles->currentUniversity($request->user());

        return ApiResponse::data(
            $university !== null ? new UniversityResource($university) : null,
        );
    }

    /**
     * @throws GetUniversityException
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     */
    public function store(
        StoreSelectUniversityRequest $request,
        SaveUniversity $useCase,
    ): JsonResponse {
        $university = $useCase->handle(
            $request->user(),
            $request->toDto(),
        );

        Notifier::send($request->user()->id, NotificationType::PROFILE_UPDATED, [
            'message' => 'Освітній профіль оновлено.',
        ]);

        return ApiResponse::ok(
            message: 'Навчальний заклад збережено.',
            data: new UniversityResource($university),
        );
    }

    public function destroy(
        Request $request,
        RemoveUniversity $useCase,
    ): JsonResponse {
        $profile = $useCase->handle($request->user());

        return ApiResponse::ok(
            message: 'Навчальний заклад видалено.',
            data: new ProfileResource($profile),
        );
    }
}
