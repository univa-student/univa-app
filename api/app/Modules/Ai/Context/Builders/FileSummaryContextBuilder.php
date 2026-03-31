<?php

declare(strict_types=1);

namespace App\Modules\Ai\Context\Builders;

use App\Modules\Ai\Contracts\ContextBuilderContract;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\DTO\SummaryContextData;
use App\Modules\Ai\DTO\SummarySourceFileData;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Files\Models\File;
use Illuminate\Database\Eloquent\Collection;
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
    public function buildFromData(SummarizeFileData $data): SummaryContextData
    {
        $files = $this->resolveFiles($data);
        $mappedFiles = [];

        foreach ($files as $file) {
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

            $mappedFiles[] = new SummarySourceFileData(
                fileId: (int) $file->getKey(),
                fileName: $fileName,
                mimeType: $this->firstNonEmptyAttribute($file, ['mime_type', 'mime', 'content_type']),
                extension: $this->firstNonEmptyAttribute($file, ['extension', 'ext']) ?? pathinfo($fileName, PATHINFO_EXTENSION) ?: null,
                size: $this->nullableInt($file->getAttribute('size')),
                disk: $this->firstNonEmptyAttribute($file, ['disk', 'storage_disk']),
                path: $this->firstNonEmptyAttribute($file, ['path', 'file_path', 'storage_path', 'storage_key']),
                subjectId: $subject ? (int) $subject->getKey() : null,
                subjectName: $subject ? $this->firstNonEmptyAttribute($subject, ['name', 'title']) : null,
                language: $data->language ?? $this->firstNonEmptyAttribute($file, ['language', 'lang']),
                extra: [
                    'file_hash' => $this->firstNonEmptyAttribute($file, ['hash', 'checksum']),
                    'visibility' => $this->firstNonEmptyAttribute($file, ['visibility']),
                    'subject_color' => $subject ? $this->firstNonEmptyAttribute($subject, ['color']) : null,
                ],
            );
        }

        $subjectIds = array_values(array_unique(array_filter(array_map(
            static fn (SummarySourceFileData $file): ?int => $file->subjectId,
            $mappedFiles,
        ))));

        $subjectNames = array_values(array_unique(array_filter(array_map(
            static fn (SummarySourceFileData $file): ?string => $file->subjectName,
            $mappedFiles,
        ))));

        $language = $data->language;
        if ($language === null) {
            foreach ($mappedFiles as $file) {
                if ($file->language !== null && trim($file->language) !== '') {
                    $language = $file->language;
                    break;
                }
            }
        }

        return new SummaryContextData(
            files: $mappedFiles,
            subjectId: count($subjectIds) === 1 ? $subjectIds[0] : null,
            subjectName: count($subjectNames) === 1 ? $subjectNames[0] : null,
            language: $language,
            extra: [
                'mode' => $data->mode->value,
                'style' => $data->style->value,
                'notes' => $data->notes,
                'force_refresh' => $data->forceRefresh,
                'requested_model' => $data->model,
                'include_flashcards' => $data->includeFlashcards,
                'file_count' => count($mappedFiles),
            ],
        );
    }

    /**
     * @throws AiContextException
     */
    private function resolveFiles(SummarizeFileData $data): Collection
    {
        $files = $this->fileModel::query()
            ->whereIn('id', $data->fileIds)
            ->where('user_id', $data->userId)
            ->with('subject')
            ->get()
            ->keyBy(static fn (File $file): int => (int) $file->getKey());

        $orderedFiles = [];

        foreach ($data->fileIds as $fileId) {
            $file = $files->get($fileId);

            if (!$file instanceof File) {
                throw AiContextException::fileNotFoundOrForbidden($fileId, $data->userId);
            }

            $orderedFiles[] = $file;
        }

        return new Collection($orderedFiles);
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
