<?php

declare(strict_types=1);

namespace App\Modules\Profiles\DTO;

final readonly class UpdateProfileData
{
    public function __construct(
        public ?string $bio,
        public ?string $phone,
        public ?string $telegram,
        public ?string $city,
        public ?string $birthDate,
    ) {}
}
