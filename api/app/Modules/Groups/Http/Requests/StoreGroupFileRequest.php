<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupFileRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:51200'],
            'folder_id' => ['nullable', 'integer', 'exists:folders,id'],
            'group_subject_id' => ['nullable', 'integer', 'exists:group_subjects,id'],
        ];
    }
}
