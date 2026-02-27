<?php

namespace App\Http\Requests\Settings;

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
            'value' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'value.required' => 'Значення налаштування є обовʼязковим.',
        ];
    }
}
