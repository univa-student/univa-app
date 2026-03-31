<?php

declare(strict_types=1);

namespace Tests\Unit\Settings;

use App\Models\User;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationUserSetting;
use App\Modules\Settings\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_raw_values_for_string_settings(): void
    {
        $user = User::factory()->create();
        $service = app(SettingsService::class);

        $service->setForUser(
            userId: $user->id,
            key: ApplicationSetting::AI_GEMINI_API_KEY_SETTING_KEY,
            value: 'user-gemini-key',
        );

        $this->assertDatabaseHas('application_user_settings', [
            'user_id' => $user->id,
            'application_setting_id' => ApplicationSetting::AI_GEMINI_API_KEY_SETTING_ID,
            'application_setting_value_id' => null,
            'raw_value' => 'user-gemini-key',
        ]);
    }

    public function test_it_bulk_saves_enum_and_raw_settings_together(): void
    {
        $user = User::factory()->create();
        $service = app(SettingsService::class);

        $service->bulkSetForUser($user->id, [
            [
                'key' => ApplicationSetting::AI_PROVIDER_SETTING_KEY,
                'value' => 'anthropic',
            ],
            [
                'key' => ApplicationSetting::AI_ANTHROPIC_API_KEY_SETTING_KEY,
                'value' => 'user-anthropic-key',
            ],
        ]);

        $providerRow = ApplicationUserSetting::query()
            ->where('user_id', $user->id)
            ->where('application_setting_id', ApplicationSetting::AI_PROVIDER_SETTING_ID)
            ->first();

        $this->assertNotNull($providerRow);
        $this->assertNull($providerRow?->raw_value);
        $this->assertNotNull($providerRow?->application_setting_value_id);

        $this->assertDatabaseHas('application_user_settings', [
            'user_id' => $user->id,
            'application_setting_id' => ApplicationSetting::AI_ANTHROPIC_API_KEY_SETTING_ID,
            'application_setting_value_id' => null,
            'raw_value' => 'user-anthropic-key',
        ]);
    }
}
