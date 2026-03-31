<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSummaryStyle;
use DomainException;

final readonly class SummarizeFileData
{
    /**
     * @param array<int, int> $fileIds
     */
    public function __construct(
        public int $userId,
        public array $fileIds,
        public AiSessionMode $mode = AiSessionMode::SUMMARY,
        public ?int $sessionId = null,
        public ?string $language = null,
        public ?string $notes = null,
        public bool $forceRefresh = false,
        public ?string $model = null,
        public AiSummaryStyle $style = AiSummaryStyle::STANDARD,
        public bool $includeFlashcards = false,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }

        if ($this->fileIds === []) {
            throw new DomainException('Потрібно передати хоча б один fileId');
        }

        foreach ($this->fileIds as $fileId) {
            if ($fileId <= 0) {
                throw new DomainException('Некоректний fileId');
            }
        }

        if ($this->mode !== AiSessionMode::SUMMARY) {
            throw new DomainException('SummarizeFileData підтримує тільки режим summary');
        }
    }

    public static function fromArray(array $data): self
    {
        $mode = $data['mode'] ?? AiSessionMode::SUMMARY;
        $style = $data['style'] ?? AiSummaryStyle::STANDARD;

        if (!$mode instanceof AiSessionMode) {
            $mode = AiSessionMode::from((string) $mode);
        }

        if (!$style instanceof AiSummaryStyle) {
            $style = AiSummaryStyle::from((string) $style);
        }

        $fileIds = $data['file_ids'] ?? [$data['file_id'] ?? null];
        if (!is_array($fileIds)) {
            $fileIds = [$fileIds];
        }

        return new self(
            userId: (int) $data['user_id'],
            fileIds: array_values(array_map('intval', array_filter(
                $fileIds,
                static fn (mixed $value): bool => is_numeric($value),
            ))),
            mode: $mode,
            sessionId: isset($data['session_id']) ? (int) $data['session_id'] : null,
            language: isset($data['language']) ? (string) $data['language'] : null,
            notes: isset($data['notes']) ? (string) $data['notes'] : null,
            forceRefresh: (bool) ($data['force_refresh'] ?? false),
            model: isset($data['model']) ? (string) $data['model'] : null,
            style: $style,
            includeFlashcards: (bool) ($data['include_flashcards'] ?? false),
        );
    }

    public function primaryFileId(): int
    {
        return $this->fileIds[0];
    }

    public function isMultiFile(): bool
    {
        return count($this->fileIds) > 1;
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'file_id' => $this->primaryFileId(),
            'file_ids' => $this->fileIds,
            'mode' => $this->mode->value,
            'session_id' => $this->sessionId,
            'language' => $this->language,
            'notes' => $this->notes,
            'force_refresh' => $this->forceRefresh,
            'model' => $this->model,
            'style' => $this->style->value,
            'include_flashcards' => $this->includeFlashcards,
        ];
    }
}
