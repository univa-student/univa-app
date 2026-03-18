<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\User\DTO\ChangePasswordData;

class ChangePasswordRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required'        => 'Введіть поточний пароль.',
            'current_password.current_password' => 'Поточний пароль невірний.',
            'password.required'                => 'Введіть новий пароль.',
            'password.min'                     => 'Пароль має бути не менше 8 символів.',
            'password.confirmed'               => 'Паролі не збігаються.',
        ];
    }

    public function toDto(): ChangePasswordData
    {
        $validated = $this->validated();

        return new ChangePasswordData(
            userId: (int) $this->user()->getAuthIdentifier(),
            currentPassword: (string) $validated['current_password'],
            password: (string) $validated['password'],
        );
    }
}
