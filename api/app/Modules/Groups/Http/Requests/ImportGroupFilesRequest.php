<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class ImportGroupFilesRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file_ids' => ['required', 'array', 'min:1'],
            'file_ids.*' => ['integer', 'exists:files,id'],
            'group_subject_id' => ['nullable', 'integer', 'exists:group_subjects,id'],
        ];
    }
}
