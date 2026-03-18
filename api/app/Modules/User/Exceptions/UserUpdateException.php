<?php

declare(strict_types=1);

namespace App\Modules\User\Exceptions;

use App\Core\Response\ResponseState;
use App\Core\UnivaHttpException;

class UserUpdateException extends UnivaHttpException
{
    public static function couldNotUpdate(string $reason): self
    {
        return new self(
            message: "Не вдалося оновити користувача: {$reason}",
            state: ResponseState::Error
        );
    }

    public static function unknownError(): self
    {
        return new self(
            message: "Сталася невідома помилка під час оновлення користувача.",
            state: ResponseState::Error
        );
    }
}
