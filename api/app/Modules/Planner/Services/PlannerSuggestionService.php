<?php

namespace App\Modules\Planner\Services;

use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Events\PlannerSuggestionGenerated;
use Carbon\Carbon;

class PlannerSuggestionService
{
    public function __construct(
        private readonly PlannerTimelineService $timelineService,
        private readonly PlannerSettingsService $settingsService,
    ) {}

    public function generateDaySuggestions(
        int $userId,
        Carbon $date,
        bool $includeTasks = true,
        bool $includeDeadlines = true,
        int $maxBlocks = 6,
    ): array {
        $dayView = $this->timelineService->buildDayView($userId, $date);
        $occupiedIntervals = collect($dayView['timeline'])
            ->map(fn (array $item): array => [
                'start' => strtotime((string) $item['start_at']),
                'end' => strtotime((string) $item['end_at']),
            ])
            ->sortBy('start')
            ->values()
            ->all();

        $bounds = $this->settingsService->getDayBounds($userId);
        $dayStart = Carbon::parse($date->toDateString() . ' ' . $bounds['start']);
        $dayEnd = Carbon::parse($date->toDateString() . ' ' . $bounds['end']);

        $candidates = collect();

        if ($includeTasks) {
            $candidates = $candidates->merge(
                Task::query()
                    ->where('user_id', $userId)
                    ->whereIn('status', [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS])
                    ->orderByRaw(
                        "case priority
                            when 'critical' then 1
                            when 'high' then 2
                            when 'medium' then 3
                            when 'low' then 4
                            else 5
                        end asc"
                    )
                    ->orderByRaw('due_at is null')
                    ->orderBy('due_at')
                    ->limit($maxBlocks)
                    ->get()
                    ->map(fn (Task $task): array => [
                        'title' => $task->title,
                        'task_id' => $task->id,
                        'deadline_id' => null,
                        'subject_id' => null,
                        'type' => PlannerBlockType::TASK->value,
                        'estimated_minutes' => 60,
                        'reason' => $task->due_at !== null
                            ? 'Задача має дедлайн і ще не завершена.'
                            : 'Активна задача ще не має блоку в плані дня.',
                    ])
            );
        }

        if ($includeDeadlines) {
            $candidates = $candidates->merge(
                Deadline::query()
                    ->where('user_id', $userId)
                    ->whereIn('status', [Deadline::STATUS_NEW, Deadline::STATUS_IN_PROGRESS])
                    ->where('due_at', '<=', $date->copy()->addDays(7)->endOfDay())
                    ->orderBy('due_at')
                    ->limit($maxBlocks)
                    ->get()
                    ->map(fn (Deadline $deadline): array => [
                        'title' => $deadline->title,
                        'task_id' => null,
                        'deadline_id' => $deadline->id,
                        'subject_id' => $deadline->subject_id,
                        'type' => PlannerBlockType::DEADLINE->value,
                        'estimated_minutes' => 60,
                        'reason' => 'Активний дедлайн наближається за строком.',
                    ])
            );
        }

        $blocks = [];
        $summaryParts = [];

        foreach ($candidates->take($maxBlocks) as $candidate) {
            $slot = $this->findNextFreeSlot(
                $dayStart,
                $dayEnd,
                $occupiedIntervals,
                (int) ($candidate['estimated_minutes'] ?? 60),
            );

            if ($slot === null) {
                break;
            }

            $occupiedIntervals[] = [
                'start' => $slot['start']->timestamp,
                'end' => $slot['end']->timestamp,
            ];
            usort($occupiedIntervals, fn (array $a, array $b): int => $a['start'] <=> $b['start']);

            $blocks[] = [
                'title' => $candidate['title'],
                'description' => null,
                'type' => $candidate['type'],
                'start_at' => $slot['start']->toISOString(),
                'end_at' => $slot['end']->toISOString(),
                'task_id' => $candidate['task_id'],
                'deadline_id' => $candidate['deadline_id'],
                'subject_id' => $candidate['subject_id'],
                'estimated_minutes' => $candidate['estimated_minutes'],
                'reason' => $candidate['reason'],
            ];

            $summaryParts[] = $candidate['title'];
        }

        $suggestion = [
            'date' => $date->toDateString(),
            'summary' => $blocks === []
                ? 'На цей день не знайдено вільних слотів для нових блоків.'
                : 'Сформовано пропозиції для: ' . implode(', ', array_slice($summaryParts, 0, 3)) . '.',
            'blocks' => $blocks,
        ];

        event(new PlannerSuggestionGenerated($userId, $suggestion));

        return $suggestion;
    }

    private function findNextFreeSlot(Carbon $dayStart, Carbon $dayEnd, array $occupied, int $minutes): ?array
    {
        $cursor = $dayStart->copy();

        foreach ($occupied as $interval) {
            $intervalStart = Carbon::createFromTimestamp($interval['start']);
            $intervalEnd = Carbon::createFromTimestamp($interval['end']);

            if ($cursor->copy()->addMinutes($minutes)->lte($intervalStart)) {
                return [
                    'start' => $cursor->copy(),
                    'end' => $cursor->copy()->addMinutes($minutes),
                ];
            }

            if ($intervalEnd->gt($cursor)) {
                $cursor = $intervalEnd->copy();
            }
        }

        if ($cursor->copy()->addMinutes($minutes)->lte($dayEnd)) {
            return [
                'start' => $cursor->copy(),
                'end' => $cursor->copy()->addMinutes($minutes),
            ];
        }

        return null;
    }
}
