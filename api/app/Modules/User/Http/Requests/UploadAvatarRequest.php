<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\User\DTO\UploadAvatarData;
use Illuminate\Http\UploadedFile;

class UploadAvatarRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'Оберіть зображення.',
            'avatar.image'    => 'Файл має бути зображенням.',
            'avatar.mimes'    => 'Допустимі формати: JPG, PNG, WebP.',
            'avatar.max'      => 'Максимальний розмір файлу — 2MB.',
        ];
    }

    public function toDto(): UploadAvatarData
    {
        /** @var UploadedFile $avatar */
        $avatar = $this->file('avatar');

        return new UploadAvatarData(
            userId: (int) $this->user()->getAuthIdentifier(),
            avatar: $avatar,
        );
    }
}
