<?php

declare(strict_types=1);

namespace App\Modules\User\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\User\DTO\DeleteAvatarData;

class DeleteAvatarRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [];
    }

    public function toDto(): DeleteAvatarData
    {
        return new DeleteAvatarData(
            userId: (int) $this->user()->getAuthIdentifier(),
        );
    }
}
