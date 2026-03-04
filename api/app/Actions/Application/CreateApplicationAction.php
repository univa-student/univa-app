<?php

namespace App\Actions\Application;

use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationUserSetting;
use Illuminate\Support\Carbon;

class CreateApplicationAction
{
    public function handle(int $userId): void
    {
        $this->createDefaultSettings($userId);
    }

    private function createDefaultSettings(int $userId): void
    {
        $settings = ApplicationSetting::query()
            ->whereNull('deleted_at')
            ->select(['id', 'type', 'default_setting_value_id'])
            ->get();

        if ($settings->isEmpty()) {
            return;
        }

        $now = Carbon::now();

        $rows = $settings->map(function ($s) use ($userId, $now) {
            return [
                'user_id' => $userId,
                'application_setting_id' => $s->id,

                'application_setting_value_id' => $s->default_setting_value_id,

                'raw_value' => null,

                'created_at' => $now,
                'updated_at' => $now,
            ];
        })->all();

        ApplicationUserSetting::query()->upsert(
            $rows,
            ['user_id', 'application_setting_id'],
            ['application_setting_value_id', 'raw_value', 'updated_at']
        );
    }
}
