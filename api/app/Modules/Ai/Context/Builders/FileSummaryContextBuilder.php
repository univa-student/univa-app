<?php

declare(strict_types=1);

namespace App\Modules\Ai\Context\Builders;

use App\Modules\Files\Models\File;
use App\Modules\Ai\Contracts\ContextBuilderContract;
use App\Modules\Ai\DTO\FileSummaryContextData;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\Exceptions\AiContextException;
use Illuminate\Database\Eloquent\Model;

final readonly class FileSummaryContextBuilder implements ContextBuilderContract
{
    public function __construct(
        private File $fileModel,
    ) {
    }

    /**
     * @throws AiContextException
     */
    public function build(object $data): object
    {
        if (!$data instanceof SummarizeFileData) {
            throw AiContextException::invalidDto(
                SummarizeFileData::class,
                get_debug_type($data),
            );
        }

        return $this->buildFromData($data);
    }

    /**
     * @throws AiContextException
     */
    public function buildFromData(SummarizeFileData $data): FileSummaryContextData
    {
        $file = $this->resolveFile($data);
        $subject = $this->resolveSubject($file);

        $fileName = $this->firstNonEmptyAttribute($file, [
            'name',
            'original_name',
            'file_name',
            'filename',
            'title',
        ]);

        if ($fileName === null) {
            throw AiContextException::fileNameCannotBeResolved((int) $file->getKey());
        }

        $mimeType = $this->firstNonEmptyAttribute($file, [
            'mime_type',
            'mime',
            'content_type',
        ]);

        $path = $this->firstNonEmptyAttribute($file, [
            'path',
            'file_path',
            'storage_path',
            'storage_key',
        ]);

        $disk = $this->firstNonEmptyAttribute($file, [
            'disk',
            'storage_disk',
        ]);

        $extension = $this->firstNonEmptyAttribute($file, [
            'extension',
            'ext',
        ]) ?? pathinfo($fileName, PATHINFO_EXTENSION) ?: null;

        $language = $data->language
            ?? $this->firstNonEmptyAttribute($file, ['language', 'lang']);

        return new FileSummaryContextData(
            fileId: (int) $file->getKey(),
            fileName: $fileName,
            mimeType: $mimeType,
            extension: $extension,
            size: $this->nullableInt($file->getAttribute('size')),
            disk: $disk,
            path: $path,
            subjectId: $subject ? (int) $subject->getKey() : null,
            subjectName: $subject ? $this->firstNonEmptyAttribute($subject, ['name', 'title']) : null,
            language: $language,
            extra: [
                'mode' => $data->mode->value,
                'notes' => $data->notes,
                'force_refresh' => $data->forceRefresh,
                'requested_model' => $data->model,
                'file_hash' => $this->firstNonEmptyAttribute($file, ['hash', 'checksum']),
                'visibility' => $this->firstNonEmptyAttribute($file, ['visibility']),
                'subject_color' => $subject ? $this->firstNonEmptyAttribute($subject, ['color']) : null,
            ],
        );
    }

    /**
     * @throws AiContextException
     */
    private function resolveFile(SummarizeFileData $data): File
    {
        $file = $this->fileModel::query()
            ->whereKey($data->fileId)
            ->where('user_id', $data->userId)
            ->with('subject')
            ->first();

        if (!$file instanceof File) {
            throw AiContextException::fileNotFoundOrForbidden($data->fileId, $data->userId);
        }

        return $file;
    }

    private function resolveSubject(File $file): ?Model
    {
        if (!method_exists($file, 'subject')) {
            return null;
        }

        $subject = $file->subject;

        return $subject instanceof Model ? $subject : null;
    }

    /**
     * @param array<int, string> $attributes
     */
    private function firstNonEmptyAttribute(Model $model, array $attributes): ?string
    {
        foreach ($attributes as $attribute) {
            $value = $model->getAttribute($attribute);

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }
}
