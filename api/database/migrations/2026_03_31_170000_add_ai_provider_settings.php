<?php

use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationSettingGroup;
use App\Modules\Settings\Models\ApplicationSettingValue;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::AI_PROVIDER_SETTING_ID,
            'group_id' => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::AI_PROVIDER_SETTING_KEY,
            'type' => SettingType::Enum->value,
            'label' => 'Провайдер AI за замовчуванням',
            'description' => 'Оберіть, через який провайдер запускати AI-сценарії, якщо ви не вказали модель вручну.',
            'constraints' => null,
            'default_setting_value_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::AI_GEMINI_API_KEY_SETTING_ID,
            'group_id' => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::AI_GEMINI_API_KEY_SETTING_KEY,
            'type' => SettingType::String->value,
            'label' => 'Gemini API key',
            'description' => 'Власний ключ Google Gemini. Якщо поле порожнє, використовується системний ключ.',
            'constraints' => json_encode(['secret' => true, 'provider' => AiProvider::GEMINI->value], JSON_THROW_ON_ERROR),
            'default_setting_value_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::AI_OPENAI_API_KEY_SETTING_ID,
            'group_id' => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::AI_OPENAI_API_KEY_SETTING_KEY,
            'type' => SettingType::String->value,
            'label' => 'OpenAI API key',
            'description' => 'Власний ключ OpenAI для ChatGPT. Якщо поле порожнє, використовується системний ключ.',
            'constraints' => json_encode(['secret' => true, 'provider' => AiProvider::OPENAI->value], JSON_THROW_ON_ERROR),
            'default_setting_value_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::AI_ANTHROPIC_API_KEY_SETTING_ID,
            'group_id' => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::AI_ANTHROPIC_API_KEY_SETTING_KEY,
            'type' => SettingType::String->value,
            'label' => 'Anthropic API key',
            'description' => 'Власний ключ Anthropic для Claude. Якщо поле порожнє, використовується системний ключ.',
            'constraints' => json_encode(['secret' => true, 'provider' => AiProvider::ANTHROPIC->value], JSON_THROW_ON_ERROR),
            'default_setting_value_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $providerValues = [
            ['value' => AiProvider::GEMINI->value, 'label' => 'Gemini', 'sort_order' => 1],
            ['value' => AiProvider::OPENAI->value, 'label' => 'ChatGPT', 'sort_order' => 2],
            ['value' => AiProvider::ANTHROPIC->value, 'label' => 'Claude', 'sort_order' => 3],
        ];

        foreach ($providerValues as $value) {
            ApplicationSettingValue::create([
                'application_setting_id' => ApplicationSetting::AI_PROVIDER_SETTING_ID,
                'value' => $value['value'],
                'label' => $value['label'],
                'sort_order' => $value['sort_order'],
                'meta' => null,
            ]);
        }

        $defaultId = ApplicationSettingValue::query()
            ->where('application_setting_id', ApplicationSetting::AI_PROVIDER_SETTING_ID)
            ->where('value', AiProvider::GEMINI->value)
            ->value('id');

        ApplicationSetting::query()
            ->whereKey(ApplicationSetting::AI_PROVIDER_SETTING_ID)
            ->update(['default_setting_value_id' => $defaultId]);
    }

    public function down(): void
    {
        ApplicationSetting::deleteWithId([
            ApplicationSetting::AI_PROVIDER_SETTING_ID,
            ApplicationSetting::AI_GEMINI_API_KEY_SETTING_ID,
            ApplicationSetting::AI_OPENAI_API_KEY_SETTING_ID,
            ApplicationSetting::AI_ANTHROPIC_API_KEY_SETTING_ID,
        ]);
    }
};
