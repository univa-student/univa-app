<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiFileLink: string
{
    case PENDING = 'pending';
    case STORED = 'stored';
    case INDEXED = 'indexed';
    case FAILED = 'failed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::STORED => 'Stored',
            self::INDEXED => 'Indexed',
            self::FAILED => 'Failed',
        };
    }
}
