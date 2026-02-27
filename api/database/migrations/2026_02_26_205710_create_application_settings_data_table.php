<?php

use App\Models\Application\Settings\ApplicationSettingGroup;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::USER_SETTINGS_GROUP_ID,
            'code' => 'user_settings',
            'name' => 'Аккаунт',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::USER_SETTINGS_GROUP_ID,
            'code' => 'user_settings',
            'name' => 'Аккаунт',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::SECURITY_SETTINGS_GROUP_ID,
            'code' => 'security_settings',
            'name' => 'Безпека',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'code' => 'notification_settings',
            'name' => 'Сповіщення',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'code' => 'appearance_settings',
            'name' => 'Зовнішній вигляд',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            'code' => 'privacy_settings',
            'name' => 'Конфіденційність',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'code' => 'ai_settings',
            'name' => 'AI-помічник',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            'code' => 'scheduler_settings',
            'name' => 'Розклад',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            'code' => 'chat_settings',
            'name' => 'Чати',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::FILE_SETTINGS_GROUP_ID,
            'code' => 'file_settings',
            'name' => 'Файли',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::ORGANIZER_SETTINGS_GROUP_ID,
            'code' => 'organizer_settings',
            'name' => 'Органайзер',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::INTEGRATION_SETTINGS_GROUP_ID,
            'code' => 'integration_settings',
            'name' => 'Інтеграції',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        ApplicationSettingGroup::insertWithId([
            'id' => ApplicationSettingGroup::DANGER_ZONE_SETTING_GROUP_ID,
            'code' => 'danger_zone',
            'name' => 'Небезпечна зона',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        ApplicationSettingGroup::deleteWithId([
            ApplicationSettingGroup::USER_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::SECURITY_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::FILE_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::ORGANIZER_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::INTEGRATION_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::DANGER_ZONE_SETTING_GROUP_ID,
        ]);
    }
};
