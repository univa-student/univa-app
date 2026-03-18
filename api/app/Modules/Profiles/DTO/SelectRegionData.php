<?php

namespace App\Modules\Profiles\DTO;

use App\Modules\Profiles\Enums\RegionCode;

final readonly class SelectRegionData
{
    public function __construct(
        public RegionCode $regionCode,
    ) {}
}
