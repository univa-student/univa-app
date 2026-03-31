<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use Carbon\CarbonImmutable;

final readonly class PlannerDaySuggestionContextData
{
    /**
     * @param array<int, array<string, mixed>> $lessons
     * @param array<int, array<string, mixed>> $plannerBlocks
     * @param array<int, array<string, mixed>> $candidateTasks
     * @param array<int, array<string, mixed>> $candidateDeadlines
     * @param array<int, array<string, mixed>> $freeSlots
     * @param array<string, mixed> $daySummary
     */
    public function __construct(
        public int $userId,
        public string $userName,
        public CarbonImmutable $date,
        public array $lessons,
        public array $plannerBlocks,
        public array $candidateTasks,
        public array $candidateDeadlines,
        public array $freeSlots,
        public array $daySummary,
    ) {
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'user_name' => $this->userName,
            'date' => $this->date->toDateString(),
            'lessons' => $this->lessons,
            'planner_blocks' => $this->plannerBlocks,
            'candidate_tasks' => $this->candidateTasks,
            'candidate_deadlines' => $this->candidateDeadlines,
            'free_slots' => $this->freeSlots,
            'day_summary' => $this->daySummary,
        ];
    }
}
