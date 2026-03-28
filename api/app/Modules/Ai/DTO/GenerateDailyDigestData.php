<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiSessionMode;
use Carbon\CarbonImmutable;
use DomainException;

final readonly class GenerateDailyDigestData
{
    public function __construct(
        public int $userId,
        public CarbonImmutable $date,
        public AiSessionMode $mode = AiSessionMode::DAILY_DIGEST,
        public bool $forceRefresh = false,
        public ?string $model = null,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }

        if ($this->mode !== AiSessionMode::DAILY_DIGEST) {
            throw new DomainException('GenerateDailyDigestData підтримує тільки режим daily_digest');
        }
    }

    public static function forDate(
        int $userId,
        CarbonImmutable $date,
        bool $forceRefresh = false,
        ?string $model = null,
    ): self {
        return new self(
            userId: $userId,
            date: $date->startOfDay(),
            forceRefresh: $forceRefresh,
            model: $model,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'date' => $this->date->toDateString(),
            'mode' => $this->mode->value,
            'force_refresh' => $this->forceRefresh,
            'model' => $this->model,
        ];
    }
}
