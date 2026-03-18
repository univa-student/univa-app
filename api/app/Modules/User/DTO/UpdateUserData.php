<?php

declare(strict_types=1);

namespace App\Modules\User\DTO;

use DomainException;

final readonly class UpdateUserData
{
    public function __construct(
        public int $userId,
        public ?string $firstName = null,
        public ?string $lastName = null,
        public ?string $username = null,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }
    }

    public static function fromArray(array $data): self
    {
        return new self(
            userId: (int) $data['user_id'],
            firstName: isset($data['first_name']) ? (string) $data['first_name'] : null,
            lastName: isset($data['last_name']) ? (string) $data['last_name'] : null,
            username: isset($data['username']) ? (string) $data['username'] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'username' => $this->username,
        ];
    }
}
