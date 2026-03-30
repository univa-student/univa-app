<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Resources;

use App\Modules\Profiles\Enums\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UniversityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $course = $this->course !== null ? (int) $this->course : null;

        return [
            'id' => $this->id,
            'external_id' => $this->university_id,
            'region_code' => $this->region_code,
            'location' => $this->location,
            'name' => $this->university_name,
            'short_name' => $this->university_short_name,
            'type_name' => $this->university_type_name,
            'faculty_name' => $this->faculty_name,
            'group_code' => $this->group_code,
            'course' => $course,
            'course_label' => $course !== null ? Course::tryFrom($course)?->label() : null,
        ];
    }
}
