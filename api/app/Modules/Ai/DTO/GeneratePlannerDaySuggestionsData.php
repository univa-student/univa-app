<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiSessionMode;
use Carbon\CarbonImmutable;
use DomainException;

final readonly class GeneratePlannerDaySuggestionsData
{
    public function __construct(
        public int $userId,
        public CarbonImmutable $date,
        public bool $includeTasks = true,
        public bool $includeDeadlines = true,
        public bool $respectLockedBlocks = true,
        public int $maxBlocks = 6,
        public AiSessionMode $mode = AiSessionMode::PLANNER,
        public ?string $model = null,
    ) {
        if ($this->userId <= 0) {
            throw new DomainException('Некоректний userId');
        }

        if ($this->maxBlocks <= 0) {
            throw new DomainException('maxBlocks має бути більшим за 0');
        }

        if ($this->mode !== AiSessionMode::PLANNER) {
            throw new DomainException('GeneratePlannerDaySuggestionsData підтримує тільки режим planner');
        }
    }

    public static function forDate(
        int $userId,
        CarbonImmutable $date,
        bool $includeTasks = true,
        bool $includeDeadlines = true,
        bool $respectLockedBlocks = true,
        int $maxBlocks = 6,
        ?string $model = null,
    ): self {
        return new self(
            userId: $userId,
            date: $date->startOfDay(),
            includeTasks: $includeTasks,
            includeDeadlines: $includeDeadlines,
            respectLockedBlocks: $respectLockedBlocks,
            maxBlocks: $maxBlocks,
            model: $model,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'date' => $this->date->toDateString(),
            'include_tasks' => $this->includeTasks,
            'include_deadlines' => $this->includeDeadlines,
            'respect_locked_blocks' => $this->respectLockedBlocks,
            'max_blocks' => $this->maxBlocks,
            'mode' => $this->mode->value,
            'model' => $this->model,
        ];
    }
}
