<?php

declare(strict_types=1);

namespace App\Modules\Ai\Exceptions;

final class UnsupportedAiAttachmentException extends AiException
{
    public static function byMimeType(?string $mimeType, ?string $fileName = null): self
    {
        return new self(
            message: 'Тип файла не підтримується для AI-обробки.',
            context: [
                'mime_type' => $mimeType,
                'file_name' => $fileName,
            ],
        );
    }

    public static function byExtension(?string $extension, ?string $fileName = null): self
    {
        return new self(
            message: 'Розширення файла не підтримується для AI-обробки.',
            context: [
                'extension' => $extension,
                'file_name' => $fileName,
            ],
        );
    }

    public static function fileTooLarge(
        int $size,
        int $maxSize,
        ?string $fileName = null,
    ): self {
        return new self(
            message: 'Файл перевищує допустимий розмір для AI-обробки.',
            context: [
                'size' => $size,
                'max_size' => $maxSize,
                'file_name' => $fileName,
            ],
        );
    }

    public static function filePathMissing(int $fileId): self
    {
        return new self(
            message: 'Не вдалося визначити шлях до файла для AI-вкладення.',
            context: [
                'file_id' => $fileId,
            ],
        );
    }
}
