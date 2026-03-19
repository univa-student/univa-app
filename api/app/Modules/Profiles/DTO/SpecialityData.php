<?php

declare(strict_types=1);

namespace App\Modules\Profiles\DTO;

final readonly class SpecialityData
{
    public function __construct(
        public string $code,
        public string $name,
        public ?string $degree,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            code: (string) ($data['speciality_code'] ?? ''),
            name: (string) ($data['speciality_name'] ?? ''),
            degree: isset($data['qualification_group_name']) ? (string) $data['qualification_group_name'] : null,
        );
    }
}
