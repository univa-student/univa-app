<?php

namespace App\Http\Requests\Files;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['nullable', 'string', 'max:255'],
            'folder_id' => ['nullable', 'integer', 'exists:folders,id'],
            'is_pinned' => ['nullable', 'boolean'],
        ];
    }
}
