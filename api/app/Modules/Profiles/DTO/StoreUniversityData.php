<?php

namespace App\Modules\Profiles\DTO;

final readonly class StoreUniversityData
{
    public function __construct(
        public string $universityId,
        public string $regionCode,
        public string $specialityName,
        public string $groupCode,
        public string $course,
    ) {}
}
