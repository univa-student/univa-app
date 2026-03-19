<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Enums;

enum Course: int
{
    case FIRST = 1;
    case SECOND = 2;
    case THIRD = 3;
    case FOURTH = 4;
    case FIFTH = 5;
    case SIXTH = 6;

    public function label(): string
    {
        return match ($this) {
            self::FIRST => '1 курс',
            self::SECOND => '2 курс',
            self::THIRD => '3 курс',
            self::FOURTH => '4 курс',
            self::FIFTH => '5 курс',
            self::SIXTH => '6 курс',
        };
    }

    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }

    public static function values(): array
    {
        return array_map(
            static fn (self $case): int => $case->value,
            self::cases(),
        );
    }
}
