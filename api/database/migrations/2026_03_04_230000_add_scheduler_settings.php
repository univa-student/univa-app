<?php

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

        $createSetting = function (
            int $id,
            string $key,
            string $type,
            string $label,
            ?string $description,
            array $values,
            string $defaultValue
        ) use ($now): void {
            ApplicationSetting::insertWithId([
                'id' => $id,
                'group_id' => ApplicationSettingGroup::SCHEDULER_SETTINGS_GROUP_ID,
                'key' => $key,
                'type' => $type,
                'label' => $label,
                'description' => $description,
                'constraints' => null,
                'default_setting_value_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach ($values as $index => $valueRow) {
                ApplicationSettingValue::create([
                    'application_setting_id' => $id,
                    'value' => $valueRow['value'],
                    'label' => $valueRow['label'],
                    'sort_order' => $index + 1,
                    'meta' => null,
                ]);
            }

            $defaultId = ApplicationSettingValue::query()
                ->where('application_setting_id', $id)
                ->where('value', $defaultValue)
                ->value('id');

            // Захист від "тихого" null, якщо дефолтне значення не знайдено
            if ($defaultId === null) {
                throw new RuntimeException("Default value '{$defaultValue}' not found for setting '{$key}' (id={$id}).");
            }

            ApplicationSetting::query()
                ->whereKey($id)
                ->update(['default_setting_value_id' => $defaultId]);
        };

        $createSetting(
            id: ApplicationSetting::SCHEDULER_DEFAULT_VIEW_SETTING_ID,
            key: ApplicationSetting::SCHEDULER_DEFAULT_VIEW_SETTING_KEY,
            type: SettingType::Enum->value,
            label: 'Перегляд розкладу за замовчуванням',
            description: 'Початковий режим відображення в модулі розкладу.',
            values: [
                ['value' => 'week',     'label' => 'Тиждень'],
                ['value' => 'month',    'label' => 'Місяць'],
                ['value' => 'day',      'label' => 'День'],
                ['value' => 'semester', 'label' => 'Семестр'],
            ],
            defaultValue: 'week'
        );

        $createSetting(
            id: ApplicationSetting::SCHEDULER_SHOW_WEEKENDS_SETTING_ID,
            key: ApplicationSetting::SCHEDULER_SHOW_WEEKENDS_SETTING_KEY,
            type: SettingType::Bool->value,
            label: 'Показувати вихідні',
            description: 'Відображати суботу та неділю у тижневому перегляді розкладу.',
            values: [
                ['value' => '1', 'label' => 'Увімкнено'],
                ['value' => '0', 'label' => 'Вимкнено'],
            ],
            defaultValue: '0'
        );

        $createSetting(
            id: ApplicationSetting::SCHEDULER_DAY_START_SETTING_ID,
            key: ApplicationSetting::SCHEDULER_DAY_START_SETTING_KEY,
            type: SettingType::Enum->value,
            label: 'Час початку дня',
            description: 'Перша година, яка відображається у денному та тижневому перегляді.',
            values: [
                ['value' => '06:00', 'label' => '06:00'],
                ['value' => '07:00', 'label' => '07:00'],
                ['value' => '08:00', 'label' => '08:00'],
                ['value' => '09:00', 'label' => '09:00'],
                ['value' => '10:00', 'label' => '10:00'],
            ],
            defaultValue: '08:00'
        );

        $createSetting(
            id: ApplicationSetting::SCHEDULER_DAY_END_SETTING_ID,
            key: ApplicationSetting::SCHEDULER_DAY_END_SETTING_KEY,
            type: SettingType::Enum->value,
            label: 'Час завершення дня',
            description: 'Остання година, яка відображається у денному та тижневому перегляді.',
            values: [
                ['value' => '18:00', 'label' => '18:00'],
                ['value' => '19:00', 'label' => '19:00'],
                ['value' => '20:00', 'label' => '20:00'],
                ['value' => '21:00', 'label' => '21:00'],
                ['value' => '22:00', 'label' => '22:00'],
                ['value' => '23:00', 'label' => '23:00'],
            ],
            defaultValue: '20:00'
        );

        $createSetting(
            id: ApplicationSetting::SCHEDULER_LESSON_REMINDER_SETTING_ID,
            key: ApplicationSetting::SCHEDULER_LESSON_REMINDER_SETTING_KEY,
            type: SettingType::Enum->value,
            label: 'Нагадування про заняття',
            description: 'За який час до початку заняття спрацьовує нагадування.',
            values: [
                ['value' => 'off', 'label' => 'Вимкнено'],
                ['value' => '10m', 'label' => '10 хвилин'],
                ['value' => '15m', 'label' => '15 хвилин'],
                ['value' => '30m', 'label' => '30 хвилин'],
                ['value' => '60m', 'label' => '60 хвилин'],
            ],
            defaultValue: '15m'
        );

        $createSetting(
            id: ApplicationSetting::SCHEDULER_WEEK_PARITY_ANCHOR_SETTING_ID,
            key: ApplicationSetting::SCHEDULER_WEEK_PARITY_ANCHOR_SETTING_KEY,
            type: SettingType::Enum->value,
            label: 'Базова парність тижня',
            description: 'Визначає, до якої парності належить базовий (якірний) тиждень.',
            values: [
                ['value' => 'even', 'label' => 'Парний тиждень'],
                ['value' => 'odd',  'label' => 'Непарний тиждень'],
            ],
            defaultValue: 'even'
        );
    }

    public function down(): void
    {
        ApplicationSetting::deleteWithId([
            ApplicationSetting::SCHEDULER_DEFAULT_VIEW_SETTING_ID,
            ApplicationSetting::SCHEDULER_SHOW_WEEKENDS_SETTING_ID,
            ApplicationSetting::SCHEDULER_DAY_START_SETTING_ID,
            ApplicationSetting::SCHEDULER_DAY_END_SETTING_ID,
            ApplicationSetting::SCHEDULER_LESSON_REMINDER_SETTING_ID,
            ApplicationSetting::SCHEDULER_WEEK_PARITY_ANCHOR_SETTING_ID,
        ]);
    }
};
