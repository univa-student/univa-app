<?php

namespace App\Modules\Profiles\DTO;

final readonly class SelectUniversityData
{
    public function __construct(
        public string $universityId,
    ) {}
}
