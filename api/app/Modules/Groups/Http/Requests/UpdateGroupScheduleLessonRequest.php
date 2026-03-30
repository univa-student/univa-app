<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class UpdateGroupScheduleLessonRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_subject_id' => ['sometimes', 'integer', 'exists:group_subjects,id'],
            'weekday' => ['sometimes', 'integer', 'between:1,7'],
            'starts_at' => ['sometimes', 'date_format:H:i'],
            'ends_at' => ['sometimes', 'date_format:H:i'],
            'lesson_type_id' => ['sometimes', 'integer', 'exists:lesson_types,id'],
            'delivery_mode_id' => ['sometimes', 'integer', 'exists:delivery_modes,id'],
            'location_text' => ['sometimes', 'nullable', 'string', 'max:255'],
            'note' => ['sometimes', 'nullable', 'string'],
            'recurrence_rule_id' => ['sometimes', 'integer', 'exists:recurrence_rules,id'],
            'active_from' => ['sometimes', 'date'],
            'active_to' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
