<?php

declare(strict_types=1);

namespace App\Modules\Ai\Exceptions;

final class AiContextException extends AiException
{
    public static function invalidDto(string $expected, string $given): self
    {
        return new self(
            message: "Некоректний DTO для AI context builder. Очікувався {$expected}, отримано {$given}.",
            context: [
                'expected' => $expected,
                'given' => $given,
            ],
        );
    }

    public static function fileNotFoundOrForbidden(int $fileId, int $userId): self
    {
        return new self(
            message: 'Файл не знайдено або доступ до нього заборонено.',
            context: [
                'file_id' => $fileId,
                'user_id' => $userId,
            ],
        );
    }

    public static function fileNameCannotBeResolved(int $fileId): self
    {
        return new self(
            message: 'Не вдалося визначити назву файла для AI-контексту.',
            context: [
                'file_id' => $fileId,
            ],
        );
    }

    public static function emptyContext(string $contextType, ?int $contextId = null): self
    {
        return new self(
            message: 'AI-контекст виявився порожнім або недостатнім для виконання операції.',
            context: [
                'context_type' => $contextType,
                'context_id' => $contextId,
            ],
        );
    }
}
