<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class UpdateGroupDeadlineRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_subject_id' => ['sometimes', 'nullable', 'integer', 'exists:group_subjects,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', 'nullable', 'string', 'max:64'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high,critical'],
            'due_at' => ['sometimes', 'date'],
            'file_ids' => ['sometimes', 'array'],
            'file_ids.*' => ['integer', 'exists:files,id'],
        ];
    }
}
