<?php

use App\Enums\SettingType;
use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationSettingGroup;
use App\Models\Application\Settings\ApplicationSettingValue;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_setting_groups', function (Blueprint $table) {
            $table->id();

            $table->string('code')
                ->unique();

            $table->string('name');

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('application_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('group_id')
                ->constrained('application_setting_groups')
                ->restrictOnDelete();

            $table->string('key')->unique(); // e.g. "appearance.theme"
            $table->string('type');          // bool | int | string | json | enum

            $table->string('label');
            $table->text('description')->nullable();

            $table->json('constraints')->nullable(); // {"min":0,"max":100} / тощо

            $table->timestamps();
            $table->softDeletes();

            $table->index('group_id');
            $table->index('key');
        });

        Schema::create('application_setting_values', function (Blueprint $table) {
            $table->id();

            $table->string('value'); // e.g. "light"
            $table->string('label'); // e.g. "Світла"

            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('application_settings', function (Blueprint $table) {
            $table->foreignId('default_setting_value_id')
                ->nullable()
                ->after('constraints')
                ->constrained('application_setting_values')
                ->nullOnDelete();

            $table->index('default_setting_value_id');
        });

        Schema::create('application_user_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('application_setting_id')
                ->constrained('application_settings')
                ->cascadeOnDelete();

            $table->foreignId('application_setting_value_id')
                ->nullable()
                ->constrained('application_setting_values')
                ->nullOnDelete();

            $table->text('raw_value')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'application_setting_id'], 'user_setting_unique');
            $table->index('user_id');
            $table->index('application_setting_id');
            $table->index('application_setting_value_id');
        });

        $now = now();

        DB::table('application_setting_groups')->insert([
            ['id' => 1,  'code' => 'notification_settings', 'name' => 'Сповіщення',       'created_at' => $now, 'updated_at' => $now],
            ['id' => 2,  'code' => 'appearance_settings',   'name' => 'Зовнішній вигляд', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3,  'code' => 'privacy_settings',      'name' => 'Конфіденційність', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4,  'code' => 'ai_settings',           'name' => 'AI-помічник',      'created_at' => $now, 'updated_at' => $now],
            ['id' => 5,  'code' => 'scheduler_settings',    'name' => 'Розклад',          'created_at' => $now, 'updated_at' => $now],
            ['id' => 6,  'code' => 'chat_settings',         'name' => 'Чати',             'created_at' => $now, 'updated_at' => $now],
            ['id' => 7,  'code' => 'file_settings',         'name' => 'Файли',            'created_at' => $now, 'updated_at' => $now],
            ['id' => 8,  'code' => 'organizer_settings',    'name' => 'Органайзер',       'created_at' => $now, 'updated_at' => $now],
            ['id' => 9,  'code' => 'integration_settings',  'name' => 'Інтеграції',       'created_at' => $now, 'updated_at' => $now],
            ['id' => 10, 'code' => 'danger_zone',           'name' => 'Небезпечна зона',  'created_at' => $now, 'updated_at' => $now],
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_ENABLED_VALUE,
            'label' => 'Увімкнено'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_DISABLED_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_DISABLED_VALUE,
            'label' => 'Вимкнено'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_APPEARANCE_LIGHT_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_APPEARANCE_LIGHT_VALUE,
            'label' => 'Світла'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_APPEARANCE_DARK_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_APPEARANCE_DARK_VALUE,
            'label' => 'Темна'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_APPEARANCE_SYSTEM_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_APPEARANCE_SYSTEM_VALUE,
            'label' => 'Системна'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_UA_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_UA_VALUE,
            'label' => 'Українська'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_EN_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_EN_VALUE,
            'label' => 'English'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_PL_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_PL_VALUE,
            'label' => 'Polski'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PUBLIC_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PUBLIC_VALUE,
            'label' => 'Публічний профіль'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_FRIENDS_ID,
            'value' => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_FRIENDS,
            'label' => 'Тільки друзі'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PRIVATE_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PRIVATE_VALUE,
            'label' => 'Приватний профіль'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_DANDER_ZONE_DEACTIVATE_ACCOUNT_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_DANDER_ZONE_DEACTIVATE_ACCOUNT_VALUE,
            'label' => 'Деактивувати акаунт'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_DANDER_ZONE_CLEAR_DATA_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_DANDER_ZONE_CLEAR_DATA_VALUE,
            'label' => 'Очистити дані'
        ]);

        ApplicationSettingValue::insertWithId([
            'id'    => ApplicationSettingValue::SETTING_DANDER_ZONE_DELETE_ACCOUNT_VALUE_ID,
            'value' => ApplicationSettingValue::SETTING_DANDER_ZONE_DELETE_ACCOUNT_VALUE,
            'label' => 'Видалити акаунт'
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::EMAIL_NOTIFICATION_SETTING_ID,
            'group_id' => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::EMAIL_NOTIFICATION_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Email-сповіщення',
            'description' => 'Отримувати сповіщення на пошту',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::WEEKLY_DIGEST_SETTING_ID,
            'group_id' => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::WEEKLY_DIGEST_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Щотижневий дайджест',
            'description' => 'Отримувати зведення активності за тиждень',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_DISABLED_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_ID,
            'group_id' => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Push-сповіщення',
            'description' => 'Отримувати push-повідомлення в браузері',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::SOUND_NOTIFICATIONS_SETTING_ID,
            'group_id' => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::SOUND_NOTIFICATIONS_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Звук сповіщень',
            'description' => 'Програвати звук при отриманні сповіщень',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::APPEARANCE_THEME_SETTING_ID,
            'group_id' => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::APPEARANCE_THEME_SETTING_KEY,
            'type' => SettingType::Enum->value,
            'label' => 'Тема',
            'description' => 'Оберіть тему інтерфейсу',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_APPEARANCE_SYSTEM_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::APPEARANCE_LANGUAGE_SETTING_ID,
            'group_id' => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::APPEARANCE_LANGUAGE_SETTING_KEY,
            'type' => SettingType::Enum->value,
            'label' => 'Мова інтерфейсу',
            'description' => 'Оберіть мову інтерфейсу',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_UA_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::APPEARANCE_COMPACT_MODE_SETTING_ID,
            'group_id' => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::APPEARANCE_COMPACT_MODE_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Компактний режим',
            'description' => 'Зменшити відступи та розміри елементів інтерфейсу',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_DISABLED_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::APPEARANCE_ANIMATIONS_SETTING_ID,
            'group_id' => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::APPEARANCE_ANIMATIONS_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Анімації',
            'description' => 'Плавні переходи між сторінками',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::PRIVACY_PROFILE_SETTING_ID,
            'group_id' => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::PRIVACY_PROFILE_SETTING_KEY,
            'type' => SettingType::Enum->value,
            'label' => 'Видимість профілю',
            'description' => 'Хто може переглядати ваш профіль',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PUBLIC_VALUE_ID,
        ]);

        ApplicationSetting::insertWithId([
            'id' => ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_ID,
            'group_id' => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            'key' => ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_KEY,
            'type' => SettingType::Bool->value,
            'label' => 'Показувати статус онлайн',
            'description' => 'Дозволити іншим бачити, коли ви онлайн',
            'constraints' => null,
            'default_setting_value_id' => ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
        ]);
    }

    public function down(): void
    {
        ApplicationSetting::deleteWithId([
            ApplicationSetting::EMAIL_NOTIFICATION_SETTING_ID,
            ApplicationSetting::WEEKLY_DIGEST_SETTING_ID,
            ApplicationSetting::PUSH_IN_BROWSER_NOTIFICATIONS_SETTING_ID,
            ApplicationSetting::SOUND_NOTIFICATIONS_SETTING_ID,
            ApplicationSetting::APPEARANCE_THEME_SETTING_ID,
            ApplicationSetting::APPEARANCE_LANGUAGE_SETTING_ID,
            ApplicationSetting::APPEARANCE_COMPACT_MODE_SETTING_ID,
            ApplicationSetting::APPEARANCE_ANIMATIONS_SETTING_ID,
            ApplicationSetting::PRIVACY_PROFILE_SETTING_ID,
            ApplicationSetting::PRIVACY_ONLINE_STATUS_SETTING_ID,
        ]);

        ApplicationSettingValue::deleteWithId([
            ApplicationSettingValue::SETTING_ENABLED_VALUE_ID,
            ApplicationSettingValue::SETTING_DISABLED_VALUE_ID,
            ApplicationSettingValue::SETTING_APPEARANCE_LIGHT_VALUE_ID,
            ApplicationSettingValue::SETTING_APPEARANCE_DARK_VALUE_ID,
            ApplicationSettingValue::SETTING_APPEARANCE_SYSTEM_VALUE_ID,
            ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_UA_VALUE_ID,
            ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_EN_VALUE_ID,
            ApplicationSettingValue::SETTING_APPEARANCE_LANGUAGE_PL_VALUE_ID,
            ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PUBLIC_VALUE_ID,
            ApplicationSettingValue::SETTING_PRIVACY_PROFILE_FRIENDS_ID,
            ApplicationSettingValue::SETTING_PRIVACY_PROFILE_PRIVATE_VALUE_ID,
            ApplicationSettingValue::SETTING_DANDER_ZONE_DEACTIVATE_ACCOUNT_VALUE_ID,
            ApplicationSettingValue::SETTING_DANDER_ZONE_CLEAR_DATA_VALUE_ID,
            ApplicationSettingValue::SETTING_DANDER_ZONE_DELETE_ACCOUNT_VALUE_ID,
        ]);

        ApplicationSettingGroup::deleteWithId([
            ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::FILE_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::ORGANIZER_SETTINGS_GROUP_ID,
            ApplicationSettingGroup::INTEGRATION_SETTINGS_GROUP_ID,
        ]);

        Schema::dropIfExists('application_user_settings');

        if (Schema::hasTable('application_settings') && Schema::hasColumn('application_settings', 'default_setting_value_id')) {
            Schema::table('application_settings', function (Blueprint $table) {
                $table->dropConstrainedForeignId('default_setting_value_id');
            });
        }

        Schema::dropIfExists('application_setting_values');
        Schema::dropIfExists('application_settings');
        Schema::dropIfExists('application_setting_groups');
    }
};
