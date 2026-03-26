<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupDeadlineRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_subject_id' => ['nullable', 'integer', 'exists:group_subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:64'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'due_at' => ['required', 'date'],
            'file_ids' => ['nullable', 'array'],
            'file_ids.*' => ['integer', 'exists:files,id'],
        ];
    }
}
