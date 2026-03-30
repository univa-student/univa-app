<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Profiles\DTO\UpdateProfileData;

class UpdateProfileRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string', 'max:5000'],
            'phone' => ['nullable', 'string', 'max:32', 'regex:/^[0-9+\-\s()]{7,32}$/'],
            'telegram' => ['nullable', 'string', 'max:64', 'regex:/^@?[A-Za-z0-9_]{5,32}$/'],
            'city' => ['nullable', 'string', 'max:120'],
            'birth_date' => ['nullable', 'date', 'before:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Некоректний номер телефону.',
            'telegram.regex' => 'Некоректний Telegram username.',
            'birth_date.before' => 'Дата народження має бути в минулому.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'bio' => $this->normalizeOptionalString('bio'),
            'phone' => $this->normalizeOptionalString('phone'),
            'telegram' => $this->normalizeOptionalString('telegram'),
            'city' => $this->normalizeOptionalString('city'),
            'birth_date' => $this->normalizeOptionalString('birth_date'),
        ]);
    }

    public function toDto(): UpdateProfileData
    {
        return new UpdateProfileData(
            bio: $this->validated('bio'),
            phone: $this->validated('phone'),
            telegram: $this->validated('telegram'),
            city: $this->validated('city'),
            birthDate: $this->validated('birth_date'),
        );
    }

    private function normalizeOptionalString(string $key): ?string
    {
        $value = $this->input($key);

        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }
}
