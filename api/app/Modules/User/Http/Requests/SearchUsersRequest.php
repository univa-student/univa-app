<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Requests;

use App\Core\Request\UnivaRequest;

class SearchUsersRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'q.required' => 'Введіть запит для пошуку користувачів.',
            'q.string' => 'Пошуковий запит має бути рядком.',
            'q.min' => 'Введіть щонайменше 2 символи.',
            'q.max' => 'Пошуковий запит не може бути довшим за 100 символів.',
        ];
    }

    public function searchTerm(): string
    {
        return trim((string) $this->validated('q'));
    }
}
