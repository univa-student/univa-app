<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

final readonly class FileSummaryContextData
{
    public function __construct(
        public int $fileId,
        public string $fileName,
        public ?string $mimeType = null,
        public ?string $extension = null,
        public ?int $size = null,
        public ?string $disk = null,
        public ?string $path = null,
        public ?int $subjectId = null,
        public ?string $subjectName = null,
        public ?string $language = null,
        public array $extra = [],
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            fileId: (int) $data['file_id'],
            fileName: (string) $data['file_name'],
            mimeType: isset($data['mime_type']) ? (string) $data['mime_type'] : null,
            extension: isset($data['extension']) ? (string) $data['extension'] : null,
            size: isset($data['size']) ? (int) $data['size'] : null,
            disk: isset($data['disk']) ? (string) $data['disk'] : null,
            path: isset($data['path']) ? (string) $data['path'] : null,
            subjectId: isset($data['subject_id']) ? (int) $data['subject_id'] : null,
            subjectName: isset($data['subject_name']) ? (string) $data['subject_name'] : null,
            language: isset($data['language']) ? (string) $data['language'] : null,
            extra: isset($data['extra']) && is_array($data['extra']) ? $data['extra'] : [],
        );
    }

    public function toArray(): array
    {
        return [
            'file_id' => $this->fileId,
            'file_name' => $this->fileName,
            'mime_type' => $this->mimeType,
            'extension' => $this->extension,
            'size' => $this->size,
            'disk' => $this->disk,
            'path' => $this->path,
            'subject_id' => $this->subjectId,
            'subject_name' => $this->subjectName,
            'language' => $this->language,
            'extra' => $this->extra,
        ];
    }

    public function displayName(): string
    {
        return $this->fileName;
    }

    public function hasSubject(): bool
    {
        return $this->subjectId !== null;
    }
}
