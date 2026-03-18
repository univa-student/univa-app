<?php

declare(strict_types=1);

namespace App\Modules\User\DTO;

use DomainException;
use Illuminate\Http\UploadedFile;

final readonly class UploadAvatarData
{
    public function __construct(
        public int $userId,
        public UploadedFile $avatar,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }
    }
}
