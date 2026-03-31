<?php

declare(strict_types=1);

namespace Tests\Unit\Ai;

use App\Models\User;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Support\AiModelResolver;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationSettingValue;
use App\Modules\Settings\Models\ApplicationUserSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class AiModelResolverTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_uses_gemini_flash_lite_as_default_model(): void
    {
        $resolver = app(AiModelResolver::class);

        $resolved = $resolver->resolve('summarize_file');

        $this->assertSame(AiProvider::GEMINI, $resolved['provider']);
        $this->assertSame('gemini-2.5-flash-lite', $resolved['model']);
    }

    public function test_it_uses_user_provider_and_personal_api_key_when_available(): void
    {
        $user = User::factory()->create();
        $openAiValueId = (int) ApplicationSettingValue::query()
            ->where('application_setting_id', ApplicationSetting::AI_PROVIDER_SETTING_ID)
            ->where('value', AiProvider::OPENAI->value)
            ->value('id');

        ApplicationUserSetting::query()->create([
            'user_id' => $user->id,
            'application_setting_id' => ApplicationSetting::AI_PROVIDER_SETTING_ID,
            'application_setting_value_id' => $openAiValueId,
            'raw_value' => null,
        ]);

        ApplicationUserSetting::query()->create([
            'user_id' => $user->id,
            'application_setting_id' => ApplicationSetting::AI_OPENAI_API_KEY_SETTING_ID,
            'application_setting_value_id' => null,
            'raw_value' => 'user-openai-key',
        ]);

        Config::set('ai.providers.openai.key', 'system-openai-key');

        $resolved = app(AiModelResolver::class)->resolve(
            useCase: 'generate_planner_day_suggestions',
            userId: $user->id,
        );

        $this->assertSame(AiProvider::OPENAI, $resolved['provider']);
        $this->assertSame('gpt-4.1-mini', $resolved['model']);
        $this->assertSame('user-openai-key', config('ai.providers.openai.key'));
    }
}
