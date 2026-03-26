<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupScheduleExceptionRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'action' => ['required', 'string', 'in:cancelled,rescheduled,modified'],
            'override_starts_at' => ['nullable', 'date_format:H:i'],
            'override_ends_at' => ['nullable', 'date_format:H:i'],
            'override_location_text' => ['nullable', 'string', 'max:255'],
            'override_teacher' => ['nullable', 'string', 'max:255'],
            'override_group_subject_id' => ['nullable', 'integer', 'exists:group_subjects,id'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
