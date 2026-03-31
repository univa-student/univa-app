<?php

declare(strict_types=1);

namespace App\Modules\Ai\Context\Builders;

use App\Models\User;
use App\Modules\Ai\Contracts\ContextBuilderContract;
use App\Modules\Ai\DTO\GeneratePlannerDaySuggestionsData;
use App\Modules\Ai\DTO\PlannerDaySuggestionContextData;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Deadlines\Models\Deadline;
use App\Modules\Organizer\Models\Task;
use App\Modules\Planner\Services\PlannerSettingsService;
use App\Modules\Planner\Services\PlannerTimelineService;
use Carbon\Carbon;

final readonly class PlannerDaySuggestionContextBuilder implements ContextBuilderContract
{
    public function __construct(
        private PlannerTimelineService $timelineService,
        private PlannerSettingsService $settingsService,
    ) {
    }

    /**
     * @throws AiContextException
     */
    public function build(object $data): object
    {
        if (!$data instanceof GeneratePlannerDaySuggestionsData) {
            throw AiContextException::invalidDto(
                GeneratePlannerDaySuggestionsData::class,
                get_debug_type($data),
            );
        }

        return $this->buildFromData($data);
    }

    /**
     * @throws AiContextException
     */
    public function buildFromData(GeneratePlannerDaySuggestionsData $data): PlannerDaySuggestionContextData
    {
        $user = User::query()->find($data->userId);

        if (!$user instanceof User) {
            throw AiContextException::fromMessage(
                'Не вдалося знайти користувача для planner AI-сценарію.',
                ['user_id' => $data->userId],
            );
        }

        $dayView = $this->timelineService->buildDayView(
            $data->userId,
            Carbon::parse($data->date->toDateString()),
        );

        $linkedTaskIds = collect($dayView['timeline'])
            ->filter(fn (array $item): bool => ($item['kind'] ?? null) === 'planner_block' && isset($item['task_id']))
            ->pluck('task_id')
            ->filter()
            ->map(fn (mixed $value): int => (int) $value)
            ->values()
            ->all();

        $linkedDeadlineIds = collect($dayView['timeline'])
            ->filter(fn (array $item): bool => ($item['kind'] ?? null) === 'planner_block' && isset($item['deadline_id']))
            ->pluck('deadline_id')
            ->filter()
            ->map(fn (mixed $value): int => (int) $value)
            ->values()
            ->all();

        return new PlannerDaySuggestionContextData(
            userId: $user->id,
            userName: trim((string) ($user->first_name ?? 'Студент')),
            date: $data->date,
            lessons: $this->formatLessons($dayView['timeline']),
            plannerBlocks: $this->formatPlannerBlocks($dayView['timeline']),
            candidateTasks: $data->includeTasks
                ? $this->formatTasks($data->userId, $linkedTaskIds, $data->maxBlocks)
                : [],
            candidateDeadlines: $data->includeDeadlines
                ? $this->formatDeadlines($data->userId, $linkedDeadlineIds, $data->date->toDateString(), $data->maxBlocks)
                : [],
            freeSlots: $this->buildFreeSlots($data->userId, $dayView['timeline'], $data->date->toDateString()),
            daySummary: $dayView['summary'],
        );
    }

    private function formatLessons(array $timeline): array
    {
        return collect($timeline)
            ->filter(fn (array $item): bool => ($item['kind'] ?? null) === 'lesson')
            ->map(fn (array $item): array => [
                'title' => (string) ($item['title'] ?? 'Пара'),
                'start_at' => (string) ($item['start_at'] ?? ''),
                'end_at' => (string) ($item['end_at'] ?? ''),
                'subject' => (string) data_get($item, 'subject.name', 'Предмет'),
                'location' => data_get($item, 'location'),
            ])
            ->values()
            ->all();
    }

    private function formatPlannerBlocks(array $timeline): array
    {
        return collect($timeline)
            ->filter(fn (array $item): bool => ($item['kind'] ?? null) === 'planner_block')
            ->map(fn (array $item): array => [
                'id' => (int) ($item['id'] ?? 0),
                'title' => (string) ($item['title'] ?? 'Блок'),
                'type' => (string) ($item['type'] ?? 'manual'),
                'status' => (string) ($item['status'] ?? 'planned'),
                'start_at' => (string) ($item['start_at'] ?? ''),
                'end_at' => (string) ($item['end_at'] ?? ''),
                'task_id' => isset($item['task_id']) ? (int) $item['task_id'] : null,
                'deadline_id' => isset($item['deadline_id']) ? (int) $item['deadline_id'] : null,
                'is_locked' => (bool) ($item['is_locked'] ?? false),
            ])
            ->values()
            ->all();
    }

    private function formatTasks(int $userId, array $excludeIds, int $limit): array
    {
        $taskLimit = min(4, max(2, $limit));

        return Task::query()
            ->where('user_id', $userId)
            ->whereIn('status', [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS])
            ->when($excludeIds !== [], fn ($query) => $query->whereNotIn('id', $excludeIds))
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
            ->limit($taskLimit)
            ->get()
            ->map(fn (Task $task): array => [
                'id' => $task->id,
                'title' => $task->title,
                'priority' => $task->priority,
                'status' => $task->status,
                'due_at' => $task->due_at?->toIso8601String(),
                'estimated_minutes' => 60,
            ])
            ->values()
            ->all();
    }

    private function formatDeadlines(int $userId, array $excludeIds, string $date, int $limit): array
    {
        $deadlineLimit = min(4, max(2, $limit));

        return Deadline::query()
            ->where('user_id', $userId)
            ->whereIn('status', [Deadline::STATUS_NEW, Deadline::STATUS_IN_PROGRESS])
            ->where('due_at', '<=', Carbon::parse($date)->addDays(7)->endOfDay())
            ->when($excludeIds !== [], fn ($query) => $query->whereNotIn('id', $excludeIds))
            ->orderBy('due_at')
            ->limit($deadlineLimit)
            ->get()
            ->map(fn (Deadline $deadline): array => [
                'id' => $deadline->id,
                'title' => $deadline->title,
                'subject_id' => $deadline->subject_id,
                'priority' => $deadline->priority,
                'status' => $deadline->status,
                'due_at' => $deadline->due_at?->toIso8601String(),
                'estimated_minutes' => 60,
            ])
            ->values()
            ->all();
    }

    private function buildFreeSlots(int $userId, array $timeline, string $date): array
    {
        $bounds = $this->settingsService->getDayBounds($userId);
        $dayStart = Carbon::parse($date . ' ' . $bounds['start']);
        $dayEnd = Carbon::parse($date . ' ' . $bounds['end']);

        $occupied = collect($timeline)
            ->map(fn (array $item): array => [
                'start' => Carbon::parse((string) $item['start_at']),
                'end' => Carbon::parse((string) $item['end_at']),
            ])
            ->sortBy(fn (array $item): int => $item['start']->timestamp)
            ->values();

        $slots = [];
        $cursor = $dayStart->copy();

        foreach ($occupied as $interval) {
            if ($interval['start']->gt($cursor)) {
                $slots[] = [
                    'start_at' => $cursor->format('Y-m-d\TH:i:s'),
                    'end_at' => $interval['start']->format('Y-m-d\TH:i:s'),
                    'minutes' => max(0, $cursor->diffInMinutes($interval['start'])),
                ];
            }

            if ($interval['end']->gt($cursor)) {
                $cursor = $interval['end']->copy();
            }
        }

        if ($cursor->lt($dayEnd)) {
            $slots[] = [
                'start_at' => $cursor->format('Y-m-d\TH:i:s'),
                'end_at' => $dayEnd->format('Y-m-d\TH:i:s'),
                'minutes' => max(0, $cursor->diffInMinutes($dayEnd)),
            ];
        }

        return array_values(array_filter($slots, fn (array $slot): bool => ($slot['minutes'] ?? 0) >= 30));
    }
}
