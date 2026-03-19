<?php

declare(strict_types=1);

namespace App\Modules\Profiles\DTO;

final readonly class FacultyData
{
    public function __construct(
        public string $name,
    ) {}
}
