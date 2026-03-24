<?php

namespace App\Modules\Files\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:2'],
            'subject_id' => ['nullable', 'integer'],
        ];
    }
}
