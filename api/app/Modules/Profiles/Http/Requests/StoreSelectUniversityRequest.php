<?php

namespace App\Modules\Profiles\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Profiles\DTO\StoreSelectUniversityData;
use App\Modules\Profiles\Enums\Course;
use App\Modules\Profiles\Enums\RegionCode;
use Illuminate\Validation\Rules\Enum;

class StoreSelectUniversityRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'university_id' => ['required', 'string', 'max:50'],
            'region_code' => ['required', 'string', new Enum(RegionCode::class)],
            'speciality_name' => ['nullable', 'string', 'max:255'],
            'group_code' => ['nullable', 'string', 'max:100'],
            'course' => ['required', 'integer', new Enum(Course::class)],
        ];
    }

    public function toDto(): StoreSelectUniversityData
    {
        return new StoreSelectUniversityData(
            universityId: (string) $this->validated('university_id'),
            regionCode: (string) $this->validated('region_code'),
            specialityName: $this->validated('speciality_name'),
            groupCode: $this->validated('group_code'),
            course: (int) $this->validated('course'),
        );
    }
}
