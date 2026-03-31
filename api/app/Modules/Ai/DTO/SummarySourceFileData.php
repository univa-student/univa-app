<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

final readonly class SummarySourceFileData
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
}
