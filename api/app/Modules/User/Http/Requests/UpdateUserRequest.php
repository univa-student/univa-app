<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\User\DTO\UpdateUserData;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()?->getAuthIdentifier();

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['nullable', 'string', 'max:100'],
            'username'   => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($userId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => "Ім'я є обов'язковим.",
            'first_name.string' => 'Ім\'я має бути рядком.',
            'first_name.max' => 'Ім\'я не може бути довшим за 100 символів.',
            'last_name.string' => 'Прізвище має бути рядком.',
            'last_name.max' => 'Прізвище не може бути довшим за 100 символів.',
            'username.required' => 'Нікнейм є обов\'язковим.',
            'username.string' => 'Нікнейм має бути рядком.',
            'username.max' => 'Нікнейм не може бути довшим за 50 символів.',
            'username.unique' => 'Цей нікнейм вже зайнятий.',
            'username.alpha_dash' => 'Нікнейм може містити лише літери, цифри, дефіси та підкреслення.',
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name' => 'ім\'я',
            'last_name' => 'прізвище',
            'username' => 'ім\'я користувача',
        ];
    }

    public function toDto(): UpdateUserData
    {
        $validated = $this->validated();

        return new UpdateUserData(
            userId: (int) $this->user()->getAuthIdentifier(),
            firstName: isset($validated['first_name']) ? (string) $validated['first_name'] : null,
            lastName: isset($validated['last_name']) ? (string) $validated['last_name'] : null,
            username: isset($validated['username']) ? (string) $validated['username'] : null,
        );
    }
}
