<?php

use App\Enums\SettingType;
use App\Models\Application\Settings\ApplicationSettingGroup;
use App\Services\Settings\SettingsService;
use Illuminate\Database\Migrations\Migration;

/**
 * Seeds the default application settings into the database.
 * Uses SettingsService::createSetting() — idempotent, safe to re-run.
 */
return new class extends Migration
{
    public function up(): void
    {
        /** @var SettingsService $svc */
        $svc = app(SettingsService::class);

        // ── GROUP 3: Notifications ─────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key'           => 'notification.email_enabled',
            'type'          => SettingType::Bool->value,
            'label'         => 'Email-сповіщення',
            'description'   => 'Отримувати сповіщення на пошту',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key'           => 'notification.push_enabled',
            'type'          => SettingType::Bool->value,
            'label'         => 'Push-сповіщення',
            'description'   => 'Отримувати push-повідомлення в браузері',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key'           => 'notification.sound_enabled',
            'type'          => SettingType::Bool->value,
            'label'         => 'Звук сповіщень',
            'description'   => 'Програвати звук при отриманні сповіщень',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::NOTIFICATION_SETTINGS_GROUP_ID,
            'key'           => 'notification.weekly_digest',
            'type'          => SettingType::Bool->value,
            'label'         => 'Щотижневий дайджест',
            'description'   => 'Отримувати зведення активності за тиждень',
            'default_value' => '0',
        ]);

        // ── GROUP 4: Appearance ────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key'           => 'appearance.theme',
            'type'          => SettingType::Enum->value,
            'label'         => 'Тема',
            'description'   => 'Тема інтерфейсу',
            'default_value' => 'system',
            'enum_options'  => json_encode([
                ['value' => 'light',  'label' => 'Світла'],
                ['value' => 'dark',   'label' => 'Темна'],
                ['value' => 'system', 'label' => 'Системна'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key'           => 'appearance.language',
            'type'          => SettingType::Enum->value,
            'label'         => 'Мова інтерфейсу',
            'description'   => 'Мова відображення',
            'default_value' => 'uk',
            'enum_options'  => json_encode([
                ['value' => 'uk', 'label' => 'Українська'],
                ['value' => 'en', 'label' => 'English'],
                ['value' => 'pl', 'label' => 'Polski'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key'           => 'appearance.compact_mode',
            'type'          => SettingType::Bool->value,
            'label'         => 'Компактний режим',
            'description'   => 'Зменшити відступи та шрифти',
            'default_value' => '0',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            'key'           => 'appearance.animations',
            'type'          => SettingType::Bool->value,
            'label'         => 'Анімації',
            'description'   => 'Плавні переходи між сторінками',
            'default_value' => '1',
        ]);

        // ── GROUP 5: Privacy ───────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            'key'           => 'privacy.profile_visibility',
            'type'          => SettingType::Enum->value,
            'label'         => 'Видимість профілю',
            'description'   => 'Хто може переглядати ваш профіль',
            'default_value' => 'friends',
            'enum_options'  => json_encode([
                ['value' => 'everyone', 'label' => 'Усі'],
                ['value' => 'friends',  'label' => 'Друзі'],
                ['value' => 'nobody',   'label' => 'Ніхто'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            'key'           => 'privacy.show_online_status',
            'type'          => SettingType::Bool->value,
            'label'         => 'Показувати статус онлайн',
            'description'   => 'Дозволити іншим бачити, коли ви онлайн',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::PRIVACY_SETTINGS_GROUP_ID,
            'key'           => 'privacy.analytics_enabled',
            'type'          => SettingType::Bool->value,
            'label'         => 'Аналітика використання',
            'description'   => 'Допомогти покращити продукт анонімними даними',
            'default_value' => '1',
        ]);

        // ── GROUP 6: AI ────────────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key'           => 'ai.model',
            'type'          => SettingType::Enum->value,
            'label'         => 'Модель AI',
            'description'   => 'Вибір моделі штучного інтелекту',
            'default_value' => 'balanced',
            'enum_options'  => json_encode([
                ['value' => 'fast',     'label' => 'Швидка'],
                ['value' => 'balanced', 'label' => 'Збалансована'],
                ['value' => 'advanced', 'label' => 'Розширена'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key'           => 'ai.creativity',
            'type'          => SettingType::Enum->value,
            'label'         => 'Творчість AI',
            'description'   => 'Рівень креативності відповідей',
            'default_value' => 'medium',
            'enum_options'  => json_encode([
                ['value' => 'low',    'label' => 'Низька'],
                ['value' => 'medium', 'label' => 'Середня'],
                ['value' => 'high',   'label' => 'Висока'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key'           => 'ai.context_memory',
            'type'          => SettingType::Bool->value,
            'label'         => "Пам'ять контексту",
            'description'   => 'AI запам\'ятовує попередні повідомлення',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key'           => 'ai.auto_suggestions',
            'type'          => SettingType::Bool->value,
            'label'         => 'Авто-підказки',
            'description'   => 'Показувати підказки при написанні',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::AI_SETTINGS_GROUP_ID,
            'key'           => 'ai.language',
            'type'          => SettingType::Enum->value,
            'label'         => 'Мова AI',
            'description'   => 'Мова відповідей AI-помічника',
            'default_value' => 'auto',
            'enum_options'  => json_encode([
                ['value' => 'auto', 'label' => 'Автоматично'],
                ['value' => 'uk',   'label' => 'Українська'],
                ['value' => 'en',   'label' => 'English'],
            ]),
        ]);

        // ── GROUP 7: Scheduler ─────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            'key'           => 'scheduler.first_day_of_week',
            'type'          => SettingType::Enum->value,
            'label'         => 'Перший день тижня',
            'description'   => 'День, з якого починається тиждень у календарі',
            'default_value' => 'mon',
            'enum_options'  => json_encode([
                ['value' => 'mon', 'label' => 'Понеділок'],
                ['value' => 'sun', 'label' => 'Неділя'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            'key'           => 'scheduler.default_view',
            'type'          => SettingType::Enum->value,
            'label'         => 'Вигляд за замовчуванням',
            'description'   => 'Початковий вигляд розкладу',
            'default_value' => 'week',
            'enum_options'  => json_encode([
                ['value' => 'day',  'label' => 'День'],
                ['value' => 'week', 'label' => 'Тиждень'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            'key'           => 'scheduler.reminder_minutes',
            'type'          => SettingType::Enum->value,
            'label'         => 'Нагадування',
            'description'   => 'За скільки хвилин надсилати нагадування',
            'default_value' => '15',
            'enum_options'  => json_encode([
                ['value' => '15', 'label' => '15 хвилин'],
                ['value' => '30', 'label' => '30 хвилин'],
                ['value' => '60', 'label' => '1 година'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
            'key'           => 'scheduler.deadline_alerts',
            'type'          => SettingType::Bool->value,
            'label'         => 'Сповіщення про дедлайни',
            'description'   => 'Отримувати нагадування про наближення дедлайнів',
            'default_value' => '1',
        ]);

        // ── GROUP 8: Chat ──────────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            'key'           => 'chat.enter_to_send',
            'type'          => SettingType::Bool->value,
            'label'         => 'Enter для надсилання',
            'description'   => 'Натискання Enter надсилає повідомлення',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            'key'           => 'chat.read_receipts',
            'type'          => SettingType::Bool->value,
            'label'         => 'Підтвердження прочитання',
            'description'   => 'Показувати позначку прочитання',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            'key'           => 'chat.media_autoplay',
            'type'          => SettingType::Bool->value,
            'label'         => 'Автовідтворення медіа',
            'description'   => 'Автоматично відтворювати відео та gif',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::CHAT_SETTINGS_GROUP_ID,
            'key'           => 'chat.link_previews',
            'type'          => SettingType::Bool->value,
            'label'         => 'Попередній перегляд посилань',
            'description'   => 'Показувати превью для URL у чаті',
            'default_value' => '1',
        ]);

        // ── GROUP 9: Files ─────────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::FILE_SETTINGS_GROUP_ID,
            'key'           => 'file.auto_sync',
            'type'          => SettingType::Bool->value,
            'label'         => 'Автосинхронізація',
            'description'   => 'Автоматично синхронізувати файли',
            'default_value' => '1',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::FILE_SETTINGS_GROUP_ID,
            'key'           => 'file.preview_quality',
            'type'          => SettingType::Enum->value,
            'label'         => 'Якість перегляду',
            'description'   => 'Якість відображення попереднього перегляду файлів',
            'default_value' => 'medium',
            'enum_options'  => json_encode([
                ['value' => 'low',    'label' => 'Низька'],
                ['value' => 'medium', 'label' => 'Середня'],
                ['value' => 'high',   'label' => 'Висока'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::FILE_SETTINGS_GROUP_ID,
            'key'           => 'file.confirm_delete',
            'type'          => SettingType::Bool->value,
            'label'         => 'Підтвердження видалення',
            'description'   => 'Запитувати підтвердження перед видаленням файлів',
            'default_value' => '1',
        ]);

        // ── GROUP 10: Organizer ────────────────────────────────────────────
        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::ORGANIZER_SETTINGS_GROUP_ID,
            'key'           => 'organizer.default_view',
            'type'          => SettingType::Enum->value,
            'label'         => 'Вигляд за замовчуванням',
            'description'   => 'Стартовий вигляд органайзера',
            'default_value' => 'kanban',
            'enum_options'  => json_encode([
                ['value' => 'kanban', 'label' => 'Kanban'],
                ['value' => 'list',   'label' => 'Список'],
                ['value' => 'table',  'label' => 'Таблиця'],
            ]),
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::ORGANIZER_SETTINGS_GROUP_ID,
            'key'           => 'organizer.auto_archive',
            'type'          => SettingType::Bool->value,
            'label'         => 'Автоархівація',
            'description'   => 'Автоматично архівувати завершені завдання',
            'default_value' => '0',
        ]);

        $svc->createSetting([
            'group_id'      => ApplicationSettingGroup::ORGANIZER_SETTINGS_GROUP_ID,
            'key'           => 'organizer.show_completed',
            'type'          => SettingType::Bool->value,
            'label'         => 'Показувати виконані',
            'description'   => 'Відображати завершені завдання у списку',
            'default_value' => '1',
        ]);
    }

    public function down(): void
    {
        /** @var SettingsService $svc */
        $svc = app(SettingsService::class);

        $keys = [
            // Notifications
            'notification.email_enabled', 'notification.push_enabled',
            'notification.sound_enabled', 'notification.weekly_digest',
            // Appearance
            'appearance.theme', 'appearance.language',
            'appearance.compact_mode', 'appearance.animations',
            // Privacy
            'privacy.profile_visibility', 'privacy.show_online_status',
            'privacy.analytics_enabled',
            // AI
            'ai.model', 'ai.creativity', 'ai.context_memory',
            'ai.auto_suggestions', 'ai.language',
            // Scheduler
            'scheduler.first_day_of_week', 'scheduler.default_view',
            'scheduler.reminder_minutes', 'scheduler.deadline_alerts',
            // Chat
            'chat.enter_to_send', 'chat.read_receipts',
            'chat.media_autoplay', 'chat.link_previews',
            // Files
            'file.auto_sync', 'file.preview_quality', 'file.confirm_delete',
            // Organizer
            'organizer.default_view', 'organizer.auto_archive',
            'organizer.show_completed',
        ];

        foreach ($keys as $key) {
            $svc->deleteSetting($key);
        }
    }
};
