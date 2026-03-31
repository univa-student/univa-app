<?php

namespace App\Modules\Planner\Services;

use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Services\SettingsService;

class PlannerSettingsService
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function getDayBounds(int $userId): array
    {
        $startValue = $this->settingsService->getEffectiveValueByKey(
            $userId,
            ApplicationSetting::SCHEDULER_DAY_START_SETTING_KEY,
        ) ?? '08:00';

        $endValue = $this->settingsService->getEffectiveValueByKey(
            $userId,
            ApplicationSetting::SCHEDULER_DAY_END_SETTING_KEY,
        ) ?? '20:00';

        return [
            'start' => $startValue,
            'end' => $endValue,
            'start_minutes' => $this->timeToMinutes($startValue),
            'end_minutes' => $this->timeToMinutes($endValue),
        ];
    }

    private function timeToMinutes(string $value): int
    {
        [$hours, $minutes] = array_pad(explode(':', $value), 2, '0');

        return ((int) $hours * 60) + (int) $minutes;
    }
}
