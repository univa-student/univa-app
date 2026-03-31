<?php

namespace App\Modules\Planner\Services;

use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Models\PlannerBlock;

class PlannerWorkloadService
{
    public function __construct(
        private readonly PlannerSettingsService $settingsService,
    ) {}

    public function buildDaySummary(int $userId, array $plannerBlocks, array $lessonItems): array
    {
        $bounds = $this->settingsService->getDayBounds($userId);
        $availableMinutes = max(0, $bounds['end_minutes'] - $bounds['start_minutes']);

        $plannedMinutes = collect($plannerBlocks)
            ->reject(fn (PlannerBlock $block): bool => $block->status === PlannerBlockStatus::CANCELED)
            ->sum(fn (PlannerBlock $block): int => $this->durationMinutes(
                $block->start_at?->timestamp,
                $block->end_at?->timestamp,
            ));

        $completedMinutes = collect($plannerBlocks)
            ->filter(fn (PlannerBlock $block): bool => $block->status === PlannerBlockStatus::COMPLETED)
            ->sum(fn (PlannerBlock $block): int => $block->actual_minutes ?? $this->durationMinutes(
                $block->start_at?->timestamp,
                $block->end_at?->timestamp,
            ));

        $focusMinutes = collect($plannerBlocks)
            ->filter(fn (PlannerBlock $block): bool => in_array(
                $block->type,
                [PlannerBlockType::FOCUS, PlannerBlockType::TASK, PlannerBlockType::DEADLINE],
                true,
            ))
            ->sum(fn (PlannerBlock $block): int => $this->durationMinutes(
                $block->start_at?->timestamp,
                $block->end_at?->timestamp,
            ));

        $lessonMinutes = collect($lessonItems)->sum(fn (array $lesson): int => $this->durationMinutes(
            strtotime((string) $lesson['start_at']),
            strtotime((string) $lesson['end_at']),
        ));

        $occupiedMinutes = $this->calculateOccupiedMinutes($plannerBlocks, $lessonItems, $bounds);
        $freeMinutes = max(0, $availableMinutes - $occupiedMinutes);
        $conflictsCount = $this->countConflicts($plannerBlocks, $lessonItems);

        return [
            'planned_minutes' => $plannedMinutes,
            'completed_minutes' => $completedMinutes,
            'lesson_minutes' => $lessonMinutes,
            'focus_minutes' => $focusMinutes,
            'free_minutes' => $freeMinutes,
            'is_overloaded' => $freeMinutes < 60 || $conflictsCount > 0,
            'conflicts_count' => $conflictsCount,
        ];
    }

    public function buildWeekSummary(array $days): array
    {
        return [
            'planned_minutes' => collect($days)->sum('summary.planned_minutes'),
            'completed_minutes' => collect($days)->sum('summary.completed_minutes'),
            'lesson_minutes' => collect($days)->sum('summary.lesson_minutes'),
            'focus_minutes' => collect($days)->sum('summary.focus_minutes'),
            'free_minutes' => collect($days)->sum('summary.free_minutes'),
            'overloaded_days_count' => collect($days)->filter(fn (array $day): bool => (bool) ($day['summary']['is_overloaded'] ?? false))->count(),
            'conflicts_count' => collect($days)->sum('summary.conflicts_count'),
        ];
    }

    private function calculateOccupiedMinutes(array $plannerBlocks, array $lessonItems, array $bounds): int
    {
        $intervals = [];

        foreach ($plannerBlocks as $block) {
            if ($block->status === PlannerBlockStatus::CANCELED) {
                continue;
            }

            $intervals[] = [
                'start' => ((int) $block->start_at?->format('H')) * 60 + (int) $block->start_at?->format('i'),
                'end' => ((int) $block->end_at?->format('H')) * 60 + (int) $block->end_at?->format('i'),
            ];
        }

        foreach ($lessonItems as $lesson) {
            $startTs = strtotime((string) $lesson['start_at']);
            $endTs = strtotime((string) $lesson['end_at']);
            $intervals[] = [
                'start' => ((int) date('H', $startTs)) * 60 + (int) date('i', $startTs),
                'end' => ((int) date('H', $endTs)) * 60 + (int) date('i', $endTs),
            ];
        }

        usort($intervals, fn (array $a, array $b): int => $a['start'] <=> $b['start']);

        $merged = [];
        foreach ($intervals as $interval) {
            $interval['start'] = max($interval['start'], $bounds['start_minutes']);
            $interval['end'] = min($interval['end'], $bounds['end_minutes']);

            if ($interval['end'] <= $interval['start']) {
                continue;
            }

            if ($merged === [] || $interval['start'] > $merged[array_key_last($merged)]['end']) {
                $merged[] = $interval;
                continue;
            }

            $merged[array_key_last($merged)]['end'] = max($merged[array_key_last($merged)]['end'], $interval['end']);
        }

        return collect($merged)->sum(fn (array $interval): int => $interval['end'] - $interval['start']);
    }

    private function countConflicts(array $plannerBlocks, array $lessonItems): int
    {
        $count = 0;
        $blockIntervals = collect($plannerBlocks)
            ->reject(fn (PlannerBlock $block): bool => $block->status === PlannerBlockStatus::CANCELED)
            ->map(fn (PlannerBlock $block): array => [
                'start' => $block->start_at?->timestamp,
                'end' => $block->end_at?->timestamp,
            ])
            ->values();

        for ($index = 0; $index < $blockIntervals->count(); $index += 1) {
            for ($inner = $index + 1; $inner < $blockIntervals->count(); $inner += 1) {
                if ($blockIntervals[$index]['start'] < $blockIntervals[$inner]['end']
                    && $blockIntervals[$index]['end'] > $blockIntervals[$inner]['start']) {
                    $count += 1;
                }
            }
        }

        foreach ($blockIntervals as $interval) {
            foreach ($lessonItems as $lesson) {
                $lessonStart = strtotime((string) $lesson['start_at']);
                $lessonEnd = strtotime((string) $lesson['end_at']);

                if ($interval['start'] < $lessonEnd && $interval['end'] > $lessonStart) {
                    $count += 1;
                }
            }
        }

        return $count;
    }

    private function durationMinutes(?int $start, ?int $end): int
    {
        if ($start === null || $end === null || $end <= $start) {
            return 0;
        }

        return (int) floor(($end - $start) / 60);
    }
}
