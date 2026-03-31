<?php

namespace App\Modules\Planner\Services;

use App\Modules\Planner\Http\Resources\PlannerBlockResource;
use App\Modules\Planner\Models\PlannerBlock;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;
use Carbon\Constants\UnitValue;
use Illuminate\Http\Request;

class PlannerTimelineService
{
    public function __construct(
        private readonly ScheduleService $scheduleService,
        private readonly PlannerWorkloadService $workloadService,
    ) {}

    public function getBlocksInRange(int $userId, Carbon $startAt, Carbon $endAt)
    {
        return PlannerBlock::query()
            ->ownedBy($userId)
            ->inRange($startAt->toDateTimeString(), $endAt->toDateTimeString())
            ->with(['subject', 'task', 'deadline'])
            ->orderBy('start_at')
            ->get();
    }

    public function buildDayView(int $userId, Carbon $date): array
    {
        $start = $date->copy()->startOfDay();
        $end = $date->copy()->endOfDay();

        $blocks = $this->getBlocksInRange($userId, $start, $end);
        $lessonItems = $this->mapLessons(
            $this->scheduleService->buildForRange($userId, $start, $end),
        );

        $blockItems = $this->mapBlocks($blocks);
        $timeline = array_merge($lessonItems, $blockItems);

        usort($timeline, fn (array $left, array $right): int => strcmp($left['start_at'], $right['start_at']));

        return [
            'date' => $date->toDateString(),
            'timeline' => $timeline,
            'summary' => $this->workloadService->buildDaySummary($userId, $blocks->all(), $lessonItems),
        ];
    }

    public function buildWeekView(int $userId, Carbon $date): array
    {
        $weekStart = $date->copy()->startOfWeek(UnitValue::MONDAY);
        $weekEnd = $date->copy()->endOfWeek(UnitValue::SUNDAY);

        $days = [];
        $cursor = $weekStart->copy();

        while ($cursor->lte($weekEnd)) {
            $days[] = $this->buildDayView($userId, $cursor->copy());
            $cursor->addDay();
        }

        return [
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekEnd->toDateString(),
            'days' => $days,
            'summary' => $this->workloadService->buildWeekSummary($days),
        ];
    }

    private function mapBlocks($blocks): array
    {
        $request = Request::create('/');

        return $blocks
            ->map(function (PlannerBlock $block) use ($request): array {
                return array_merge(
                    ['kind' => 'planner_block'],
                    new PlannerBlockResource($block)->toArray($request),
                );
            })
            ->values()
            ->all();
    }

    private function mapLessons(array $lessons): array
    {
        return array_values(array_map(function (array $lesson): array {
            $startAt = Carbon::parse($lesson['date'] . ' ' . $lesson['starts_at']);
            $endAt = $lesson['ends_at'] !== null
                ? Carbon::parse($lesson['date'] . ' ' . $lesson['ends_at'])
                : $startAt->copy()->addMinutes(90);

            return [
                'kind' => 'lesson',
                'id' => $lesson['id'],
                'lesson_id' => $lesson['lesson_id'],
                'title' => $lesson['subject']['name'] ?? 'Заняття',
                'start_at' => $startAt->format('Y-m-d\TH:i:s'),
                'end_at' => $endAt->format('Y-m-d\TH:i:s'),
                'readonly' => true,
                'source' => $lesson['source'],
                'subject' => [
                    'id' => $lesson['subject']['id'] ?? null,
                    'name' => $lesson['subject']['name'] ?? null,
                    'color' => $lesson['subject']['color'] ?? null,
                ],
                'location' => $lesson['location'] ?? null,
                'note' => $lesson['note'] ?? null,
            ];
        }, $lessons));
    }
}
