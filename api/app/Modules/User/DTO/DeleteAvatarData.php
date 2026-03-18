<?php

declare(strict_types=1);

namespace App\Modules\User\DTO;

use DomainException;

final readonly class DeleteAvatarData
{
    public function __construct(
        public int $userId,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }
    }
}
