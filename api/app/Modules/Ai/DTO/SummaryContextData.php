<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

final readonly class SummaryContextData
{
    /**
     * @param array<int, SummarySourceFileData> $files
     * @param array<string, mixed> $extra
     */
    public function __construct(
        public array $files,
        public ?int $subjectId = null,
        public ?string $subjectName = null,
        public ?string $language = null,
        public array $extra = [],
    ) {
    }

    public function isMultiFile(): bool
    {
        return count($this->files) > 1;
    }

    public function primaryFile(): ?SummarySourceFileData
    {
        return $this->files[0] ?? null;
    }

    /**
     * @return array<int, int>
     */
    public function fileIds(): array
    {
        return array_values(array_map(
            static fn (SummarySourceFileData $file): int => $file->fileId,
            $this->files,
        ));
    }

    /**
     * @return array<int, string>
     */
    public function fileNames(): array
    {
        return array_values(array_map(
            static fn (SummarySourceFileData $file): string => $file->fileName,
            $this->files,
        ));
    }

    public function displayName(): string
    {
        if ($this->isMultiFile()) {
            return 'Пакет матеріалів';
        }

        return $this->primaryFile()?->fileName ?? 'Матеріал';
    }

    public function toArray(): array
    {
        return [
            'files' => array_map(
                static fn (SummarySourceFileData $file): array => $file->toArray(),
                $this->files,
            ),
            'subject_id' => $this->subjectId,
            'subject_name' => $this->subjectName,
            'language' => $this->language,
            'extra' => $this->extra,
        ];
    }
}
