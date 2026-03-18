<?php

declare(strict_types=1);

namespace App\Modules\Profiles\DTO;

final readonly class UniversityDetailsData
{
    public function __construct(
        public string $id,
        public string $name,
        public ?string $shortName,
        public ?string $typeName,
        public ?string $nameEn,
        public ?string $region,
        public ?string $city,
        public ?string $location,
        public ?string $address,
        public ?string $site,
        public ?string $email,
        public ?string $phone,

        /** @var array<FacultyData> */
        public array $faculties,

        /** @var array<SpecialityData> */
        public array $specialities,
    ) {}

    public static function fromArray(array $data): self
    {
        $region = $data['region_name_u'] ?? null;
        $city = $data['katottg_name_u'] ?? null;

        return new self(
            id: (string) $data['university_id'],
            name: (string) $data['university_name'],
            shortName: isset($data['university_short_name']) ? (string) $data['university_short_name'] : null,
            typeName: isset($data['university_type_name']) ? (string) $data['university_type_name'] : null,
            nameEn: isset($data['university_name_en']) ? (string) $data['university_name_en'] : null,
            region: $region ? (string) $region : null,
            city: $city ? (string) $city : null,
            location: self::makeLocation(
                $city ? (string) $city : null,
                $region ? (string) $region : null,
            ),
            address: isset($data['university_address_u']) ? (string) $data['university_address_u'] : null,
            site: isset($data['university_site']) ? (string) $data['university_site'] : null,
            email: isset($data['university_email']) ? (string) $data['university_email'] : null,
            phone: isset($data['university_phone']) ? (string) $data['university_phone'] : null,
            faculties: self::mapFaculties($data['facultets'] ?? []),
            specialities: self::mapSpecialities($data['speciality_licenses'] ?? []),
        );
    }

    private static function makeLocation(?string $city, ?string $region): ?string
    {
        $parts = array_values(array_filter([$city, $region], static fn (?string $value): bool => filled($value)));

        if ($parts === []) {
            return null;
        }

        return implode(', ', $parts);
    }

    private static function mapFaculties(array $items): array
    {
        return array_map(
            static fn (string $name): FacultyData => new FacultyData($name),
            $items
        );
    }

    private static function mapSpecialities(array $items): array
    {
        return array_map(
            static fn (array $item): SpecialityData => SpecialityData::fromArray($item),
            $items
        );
    }
}
