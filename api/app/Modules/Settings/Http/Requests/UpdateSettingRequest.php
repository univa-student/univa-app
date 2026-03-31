<?php

namespace App\Modules\Settings\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guarded by auth:sanctum middleware
    }

    public function rules(): array
    {
        return [
            'value' => ['present', 'string', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'value.required' => 'Значення налаштування є обовʼязковим.',
        ];
    }
}
