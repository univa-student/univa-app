<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiSessionStatus: string
{
    case ACTIVE = 'active';
    case ARCHIVED = 'archived';
    case CLOSED = 'closed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::ARCHIVED => 'Archived',
            self::CLOSED => 'Closed',
        };
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function isClosed(): bool
    {
        return $this === self::CLOSED;
    }

    public function canAcceptNewRuns(): bool
    {
        return $this === self::ACTIVE;
    }
}
