<?php

declare(strict_types=1);

namespace App\Modules\Profiles\DTO;

final readonly class StoreSelectUniversityData
{
    public function __construct(
        public string $universityId,
        public string $regionCode,
        public ?string $specialityName,
        public ?string $groupCode,
        public int $course,
    ) {}
}
