<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use Carbon\CarbonImmutable;

final readonly class DailyDigestContextData
{
    /**
     * @param array<int, array<string, mixed>> $todayLessons
     * @param array<int, array<string, mixed>> $priorityDeadlines
     * @param array<int, array<string, mixed>> $recentFiles
     * @param array<string, int> $stats
     * @param array<string, mixed> $storage
     */
    public function __construct(
        public int $userId,
        public string $userName,
        public CarbonImmutable $date,
        public array $todayLessons,
        public array $priorityDeadlines,
        public array $recentFiles,
        public array $stats,
        public array $storage,
    ) {
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'user_name' => $this->userName,
            'date' => $this->date->toDateString(),
            'today_lessons' => $this->todayLessons,
            'priority_deadlines' => $this->priorityDeadlines,
            'recent_files' => $this->recentFiles,
            'stats' => $this->stats,
            'storage' => $this->storage,
        ];
    }
}
