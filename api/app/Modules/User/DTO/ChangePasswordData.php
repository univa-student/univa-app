<?php

declare(strict_types=1);

namespace App\Modules\User\DTO;

use DomainException;

final readonly class ChangePasswordData
{
    public function __construct(
        public int $userId,
        public string $currentPassword,
        public string $password,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }
    }

    public static function fromArray(array $data): self
    {
        return new self(
            userId: (int) $data['user_id'],
            currentPassword: (string) $data['current_password'],
            password: (string) $data['password'],
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'current_password' => $this->currentPassword,
            'password' => $this->password,
        ];
    }
}
