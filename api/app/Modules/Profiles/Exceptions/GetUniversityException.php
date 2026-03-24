<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Exceptions;

use App\Core\UnivaHttpException;

final class GetUniversityException extends UnivaHttpException
{
    public static function byRegionCode(): self
    {
        return new self(
            message: 'Не вдалось завантажити список навчальних закладів',
        );
    }

    public static function byId(): self
    {
        return new self(
            message: 'Не вдалось завантажити навчальний заклад',
        );
    }

    public static function invalidData(): self
    {
        return new self(
            message: 'Не вірний формат відповіді',
        );
    }
}
