<?php

declare(strict_types=1);

namespace App\Modules\Ai\Support;

use App\Modules\Ai\DTO\FileSummaryContextData;
use App\Modules\Ai\Exceptions\AiException;
use App\Modules\Ai\Exceptions\UnsupportedAiAttachmentException;
use Illuminate\Support\Facades\Storage;
use Throwable;

final readonly class AiAttachmentFactory
{
    /**
     * @param array<int, string> $allowedMimeTypes
     * @param array<int, string> $allowedExtensions
     */
    public function __construct(
        private array $allowedMimeTypes = [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'text/html',
            'application/xml',
            'text/xml',
        ],
        private array $allowedExtensions = [
            'pdf',
            'txt',
            'md',
            'doc',
            'docx',
        ],
        private int $maxSizeBytes = 25_000_000,
    ) {
    }

    /**
     * Повертає нормалізований payload для подальшого adapter-layer.
     *
     * @return array{
     *     disk: string,
     *     path: string,
     *     absolute_path: string|null,
     *     file_name: string,
     *     mime_type: string|null,
     *     extension: string|null,
     *     size: int|null
     * }
     * @throws UnsupportedAiAttachmentException|AiException
     */
    public function buildPayload(FileSummaryContextData $context): array
    {
        $this->assertSupported($context);

        $disk = $context->disk ?: config('filesystems.default', 'local');
        $path = $context->path;

        if ($path === null || trim($path) === '') {
            throw UnsupportedAiAttachmentException::filePathMissing($context->fileId);
        }

        if (!Storage::disk($disk)->exists($path)) {
            throw AiException::fromMessage(
                'Файл не знайдено у файловому сховищі.',
                [
                    'file_id' => $context->fileId,
                    'disk' => $disk,
                    'path' => $path,
                ],
            );
        }

        try {
            $absolutePath = Storage::disk($disk)->path($path);
        } catch (Throwable) {
            $absolutePath = null;
        }

        return [
            'disk' => $disk,
            'path' => $path,
            'absolute_path' => $absolutePath,
            'file_name' => $context->fileName,
            'mime_type' => $context->mimeType,
            'extension' => $this->normalizeExtension($context->extension),
            'size' => $context->size,
        ];
    }

    /**
     * @throws UnsupportedAiAttachmentException
     */
    public function assertSupported(FileSummaryContextData $context): void
    {
        if ($context->size !== null && $context->size > $this->maxSizeBytes) {
            throw UnsupportedAiAttachmentException::fileTooLarge(
                size: $context->size,
                maxSize: $this->maxSizeBytes,
                fileName: $context->fileName,
            );
        }

        $extension = $this->normalizeExtension($context->extension);
        $mimeType = $context->mimeType !== null ? trim($context->mimeType) : null;

        if ($extension !== null && !in_array($extension, $this->allowedExtensions, true)) {
            throw UnsupportedAiAttachmentException::byExtension($extension, $context->fileName);
        }

        if ($mimeType !== null && !in_array($mimeType, $this->allowedMimeTypes, true)) {
            throw UnsupportedAiAttachmentException::byMimeType($mimeType, $context->fileName);
        }

        if ($extension === null && $mimeType === null) {
            throw UnsupportedAiAttachmentException::byExtension(null, $context->fileName);
        }
    }

    private function normalizeExtension(?string $extension): ?string
    {
        if ($extension === null || trim($extension) === '') {
            return null;
        }

        return ltrim(strtolower(trim($extension)), '.');
    }
}
