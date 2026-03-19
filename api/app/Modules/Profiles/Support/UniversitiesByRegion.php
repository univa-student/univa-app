<?php

namespace App\Modules\Profiles\Support;

use App\Modules\Profiles\DTO\UniversitiesData;
use App\Modules\Profiles\DTO\UniversityDetailsData;
use App\Modules\Profiles\Exceptions\GetUniversityException;
use App\Modules\Profiles\Integrations\EdboConnector;
use App\Modules\Profiles\Integrations\Requests\GetUniversityByIdRequest;
use App\Modules\Profiles\Integrations\Requests\GetUniversityByRegionRequest;
use JsonException;
use Saloon\Exceptions\Request\FatalRequestException;
use Saloon\Exceptions\Request\RequestException;

class UniversitiesByRegion
{
    /**
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     * @throws GetUniversityException
     */
    public function getByRegion(string $region): array
    {
        $connector = new EdboConnector();

        $response = $connector->send(
            new GetUniversityByRegionRequest($region)
        );

        if ($response->failed()) {
            throw new GetUniversityException()->byRegionCode();
        }

        return collect($response->json())
            ->map(fn ($item) => UniversitiesData::fromArray($item))
            ->toArray();
    }

    /**
     * @throws FatalRequestException
     * @throws RequestException
     * @throws JsonException
     * @throws GetUniversityException
     */
    public function getByUniversityId(string $id): UniversityDetailsData
    {
        $connector = new EdboConnector();

        $response = $connector->send(
            new GetUniversityByIdRequest($id)
        );

        if ($response->failed()) {
            throw new GetUniversityException()->byId();
        }

        $data = $response->json();

        if (!is_array($data) || $data === []) {
            throw new GetUniversityException()->invalidData();
        }

        return UniversityDetailsData::fromArray($data);
    }
}
