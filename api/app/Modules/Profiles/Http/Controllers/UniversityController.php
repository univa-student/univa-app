<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Controllers;

use App\Core\Response\ApiResponse;
use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;
use App\Http\Controllers\Controller;
use App\Modules\Profiles\Enums\Course;
use App\Modules\Profiles\Enums\RegionCode;
use App\Modules\Profiles\Exceptions\GetUniversityException;
use App\Modules\Profiles\Http\Requests\SelectRegionRequest;
use App\Modules\Profiles\Http\Requests\SelectUniversityRequest;
use App\Modules\Profiles\Http\Requests\StoreSelectUniversityRequest;
use App\Modules\Profiles\Models\University;
use App\Modules\Profiles\Support\UniversitiesByRegion;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
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

    /**
     * @throws GetUniversityException
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     */
    public function store(StoreSelectUniversityRequest $request): JsonResponse
    {
        $dto = $request->toDto();

        $data = app(UniversitiesByRegion::class)
            ->getByUniversityId($dto->universityId);

        $actualRegion = RegionCode::tryFromLabel($data->region);

        if ($actualRegion === null) {
            throw new UnivaHttpException('Не вдалося визначити регіон закладу освіти.');
        }

        if ($actualRegion->value !== $dto->regionCode) {
            throw new UnivaHttpException('Обраний заклад не належить до вибраного регіону.');
        }

        $university = University::query()->updateOrCreate(
            [
                'university_id' => $dto->universityId,
            ],
            [
                'user_id' => auth()->id(),
                'region_code' => $dto->regionCode,
                'university_name' => $data->name,
                'location' => $data->location,
                'university_short_name' => $data->shortName,
                'university_type_name' => $data->typeName,
                'faculty_name' => $dto->specialityName,
                'group_code' => $dto->groupCode,
                'course' => $dto->course,
            ],
        );

        return ApiResponse::make(
            state: ResponseState::OK,
            data: $university,
        );
    }
}

