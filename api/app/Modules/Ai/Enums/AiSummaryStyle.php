<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiSummaryStyle: string
{
    case STANDARD = 'standard';
    case TEACHER = 'teacher';
    case BEGINNER = 'beginner';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::STANDARD => 'standard',
            self::TEACHER => 'teacher',
            self::BEGINNER => 'beginner',
        };
    }
}
