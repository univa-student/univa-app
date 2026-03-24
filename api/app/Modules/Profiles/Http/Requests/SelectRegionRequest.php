<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Profiles\DTO\SelectRegionData;
use App\Modules\Profiles\Enums\RegionCode;
use Illuminate\Validation\Rules\Enum;

class SelectRegionRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'region_code' => [
                'required',
                'string',
                new Enum(RegionCode::class)
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'region_code.required' => 'Оберіть регіон.',
        ];
    }

    public function toDto(): SelectRegionData
    {
        return new SelectRegionData(
            regionCode: RegionCode::from((string) $this->validated('region_code')),
        );
    }
}
