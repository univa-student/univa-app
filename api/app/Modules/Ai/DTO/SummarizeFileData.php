<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiSessionMode;
use DomainException;

final readonly class SummarizeFileData
{
    public function __construct(
        public int $userId,
        public int $fileId,
        public AiSessionMode $mode = AiSessionMode::SUMMARY,
        public ?int $sessionId = null,
        public ?string $language = null,
        public ?string $notes = null,
        public bool $forceRefresh = false,
        public ?string $model = null,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }

        if ($this->fileId <= 0) {
            throw new DomainException('Некоректний fileId');
        }

        if ($this->mode !== AiSessionMode::SUMMARY) {
            throw new DomainException('SummarizeFileData підтримує тільки режим summary');
        }
    }

    public static function fromArray(array $data): self
    {
        $mode = $data['mode'] ?? AiSessionMode::SUMMARY;

        if (!$mode instanceof AiSessionMode) {
            $mode = AiSessionMode::from((string) $mode);
        }

        return new self(
            userId: (int) $data['user_id'],
            fileId: (int) $data['file_id'],
            mode: $mode,
            sessionId: isset($data['session_id']) ? (int) $data['session_id'] : null,
            language: isset($data['language']) ? (string) $data['language'] : null,
            notes: isset($data['notes']) ? (string) $data['notes'] : null,
            forceRefresh: (bool) ($data['force_refresh'] ?? false),
            model: isset($data['model']) ? (string) $data['model'] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'file_id' => $this->fileId,
            'mode' => $this->mode->value,
            'session_id' => $this->sessionId,
            'language' => $this->language,
            'notes' => $this->notes,
            'force_refresh' => $this->forceRefresh,
            'model' => $this->model,
        ];
    }
}
