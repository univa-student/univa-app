<?php

namespace App\Modules\Profiles\DTO;

final readonly class UniversitiesData
{
    public function __construct(
        public string $id,
        public string $name,
        public ?string $shortName,
        public ?string $region,
    ) {}

    public static function fromArray(array $item): self
    {
        return new self(
            id: $item['university_id'],
            name: $item['university_name'],
            shortName: $item['university_short_name'] ?? null,
            region: $item['region_name_u'] ?? null,
        );
    }
}
