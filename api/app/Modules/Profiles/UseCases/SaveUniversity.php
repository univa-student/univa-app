<?php

declare(strict_types=1);

namespace App\Modules\Profiles\UseCases;

use App\Core\UnivaHttpException;
use App\Models\User;
use App\Modules\Profiles\DTO\StoreSelectUniversityData;
use App\Modules\Profiles\Enums\RegionCode;
use App\Modules\Profiles\Models\University;
use App\Modules\Profiles\Services\ProfileService;
use App\Modules\Profiles\Support\UniversitiesByRegion;
use Illuminate\Support\Facades\DB;
use JsonException;
use Saloon\Exceptions\Request\FatalRequestException;
use Saloon\Exceptions\Request\RequestException;

class SaveUniversity
{
    public function __construct(
        private readonly UniversitiesByRegion $universities,
        private readonly ProfileService $profiles,
    ) {}

    /**
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     */
    public function handle(User $user, StoreSelectUniversityData $data): University
    {
        $details = $this->universities->getByUniversityId($data->universityId);

        $actualRegion = RegionCode::tryFromLabel($details->region);

        if ($actualRegion === null) {
            throw new UnivaHttpException('Не вдалося визначити регіон закладу освіти.');
        }

        if ($actualRegion->value !== $data->regionCode) {
            throw new UnivaHttpException('Обраний заклад не належить до вибраного регіону.');
        }

        return DB::transaction(function () use ($user, $data, $details) {
            $profile = $this->profiles->ensureForUser($user);
            $previousUniversityId = $profile->university_id;

            $university = University::query()->updateOrCreate(
                [
                    'user_id' => (string) $user->id,
                ],
                [
                    'university_id' => $data->universityId,
                    'region_code' => $data->regionCode,
                    'location' => $details->location,
                    'university_name' => $details->name,
                    'university_short_name' => $details->shortName,
                    'university_type_name' => $details->typeName,
                    'faculty_name' => $data->specialityName,
                    'group_code' => $data->groupCode,
                    'course' => $data->course,
                ],
            );

            $this->profiles->attachUniversity($user, $university);

            if ($previousUniversityId !== null && $previousUniversityId !== $university->id) {
                $previousUniversity = University::query()->find($previousUniversityId);

                if ($previousUniversity !== null && (string) $previousUniversity->user_id === (string) $user->id) {
                    $previousUniversity->delete();
                }
            }

            return $university->fresh();
        });
    }
}
