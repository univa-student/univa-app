<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupScheduleLessonRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_subject_id' => ['required', 'integer', 'exists:group_subjects,id'],
            'weekday' => ['required', 'integer', 'between:1,7'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
            'lesson_type_id' => ['required', 'integer', 'exists:lesson_types,id'],
            'delivery_mode_id' => ['required', 'integer', 'exists:delivery_modes,id'],
            'location_text' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
            'recurrence_rule_id' => ['required', 'integer', 'exists:recurrence_rules,id'],
            'active_from' => ['required', 'date'],
            'active_to' => ['nullable', 'date', 'after_or_equal:active_from'],
        ];
    }
}
