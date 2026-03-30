<?php

namespace App\Modules\Groups\Enums;

enum GroupRole: string
{
    case Owner = 'owner';
    case Moderator = 'moderator';
    case Headman = 'headman';
    case Student = 'student';

    public function rank(): int
    {
        return match ($this) {
            self::Owner => 400,
            self::Moderator => 300,
            self::Headman => 200,
            self::Student => 100,
        };
    }

    public function allows(self|string $required): bool
    {
        $requiredRole = is_string($required) ? self::from($required) : $required;

        return $this->rank() >= $requiredRole->rank();
    }
}
