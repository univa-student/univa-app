<?php

namespace App\Modules\Files\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file'       => ['required', 'file', 'max:51200'], // 50 MB
            'folder_id'  => ['nullable', 'integer', 'exists:folders,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'scope'      => ['nullable', 'string', 'in:personal,subject,group'],
        ];
    }
}
