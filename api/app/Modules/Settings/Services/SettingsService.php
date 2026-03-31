<?php

namespace App\Modules\Settings\Services;

use App\Core\UnivaHttpException;
use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Models\ApplicationSettingValue;
use App\Modules\Settings\Models\ApplicationUserSetting;

class SettingsService
{
    /**
     * @throws UnivaHttpException
     */
    public function getValueId(int $userId, int $settingId): int
    {
        $setting = ApplicationSetting::query()
            ->select(['id', 'default_setting_value_id'])
            ->find($settingId);

        if (! $setting) {
            throw new UnivaHttpException('Налаштування не знайдено.');
        }

        $userValueId = ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->where('application_setting_id', $settingId)
            ->value('application_setting_value_id');

        $effective = $userValueId ?? $setting->default_setting_value_id;

        if ($effective === null) {
            throw new UnivaHttpException('Значення налаштування не встановлено.');
        }

        return (int) $effective;
    }

    public function getUserValueId(int $userId, int $settingId): ?int
    {
        $valueId = ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->where('application_setting_id', $settingId)
            ->value('application_setting_value_id');

        return $valueId !== null ? (int) $valueId : null;
    }

    public function getEffectiveValueByKey(int $userId, string $key): ?string
    {
        $setting = ApplicationSetting::query()
            ->with('defaultValue:id,value')
            ->select(['id', 'default_setting_value_id'])
            ->where('key', $key)
            ->first();

        if (! $setting) {
            return null;
        }

        $userSetting = ApplicationUserSetting::query()
            ->select(['application_setting_value_id', 'raw_value'])
            ->where('user_id', $userId)
            ->where('application_setting_id', $setting->id)
            ->first();

        if ($userSetting?->raw_value !== null) {
            return (string) $userSetting->raw_value;
        }

        $valueId = $userSetting?->application_setting_value_id ?? $setting->default_setting_value_id;

        if ($valueId === null) {
            return null;
        }

        if ((int) $valueId === (int) $setting->default_setting_value_id && $setting->defaultValue !== null) {
            return (string) $setting->defaultValue->value;
        }

        $value = ApplicationSettingValue::query()
            ->whereKey($valueId)
            ->value('value');

        return $value !== null ? (string) $value : null;
    }

    /**
     * @throws UnivaHttpException
     */
    public function setValueId(int $userId, int $settingId, int $valueId): void
    {
        if (! ApplicationSetting::query()->whereKey($settingId)->exists()) {
            throw new UnivaHttpException('Налаштування не знайдено.');
        }

        $belongs = ApplicationSettingValue::query()
            ->where('id', $valueId)
            ->where('application_setting_id', $settingId)
            ->exists();

        if (! $belongs) {
            throw new UnivaHttpException('Значення налаштування не належить до цього налаштування.');
        }

        ApplicationUserSetting::query()->updateOrCreate(
            ['user_id' => $userId, 'application_setting_id' => $settingId],
            [
                'application_setting_value_id' => $valueId,
                'raw_value' => null,
            ]
        );
    }

    /**
     * @throws UnivaHttpException
     */
    public function resetToDefault(int $userId, int $settingId): void
    {
        if (! ApplicationSetting::query()->whereKey($settingId)->exists()) {
            throw new UnivaHttpException('Налаштування не знайдено.');
        }

        ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->where('application_setting_id', $settingId)
            ->delete();
    }

    /**
     * @throws UnivaHttpException
     */
    public function setForUser(int $userId, string $key, string $value): void
    {
        $setting = ApplicationSetting::query()
            ->select(['id', 'key', 'type'])
            ->where('key', $key)
            ->first();

        if (! $setting) {
            throw new UnivaHttpException('Налаштування не знайдено.');
        }

        if ($this->usesRawValue($setting->type)) {
            ApplicationUserSetting::query()->updateOrCreate(
                ['user_id' => $userId, 'application_setting_id' => $setting->id],
                [
                    'application_setting_value_id' => null,
                    'raw_value' => $this->normalizeRawValue($setting->type, $value),
                ]
            );

            return;
        }

        $settingValue = ApplicationSettingValue::query()
            ->select(['id'])
            ->where('application_setting_id', $setting->id)
            ->where('value', $value)
            ->first();

        if (! $settingValue) {
            throw new UnivaHttpException('Недопустиме значення для цього налаштування.');
        }

        ApplicationUserSetting::query()->updateOrCreate(
            ['user_id' => $userId, 'application_setting_id' => $setting->id],
            [
                'application_setting_value_id' => $settingValue->id,
                'raw_value' => null,
            ]
        );
    }

    /**
     * @param  array<array{key:string,value:string}>  $pairs
     *
     * @throws UnivaHttpException
     */
    public function bulkSetForUser(int $userId, array $pairs): void
    {
        $keys = array_column($pairs, 'key');

        $settings = ApplicationSetting::query()
            ->select(['id', 'key', 'type'])
            ->whereIn('key', $keys)
            ->get()
            ->keyBy('key');

        $upserts = [];

        foreach ($pairs as $pair) {
            $setting = $settings->get($pair['key']);

            if (! $setting) {
                throw new UnivaHttpException("Налаштування '{$pair['key']}' не знайдено.");
            }

            if ($this->usesRawValue($setting->type)) {
                $upserts[] = [
                    'setting_id' => $setting->id,
                    'value_id' => null,
                    'raw_value' => $this->normalizeRawValue($setting->type, $pair['value']),
                ];

                continue;
            }

            $settingValue = ApplicationSettingValue::query()
                ->select(['id'])
                ->where('application_setting_id', $setting->id)
                ->where('value', $pair['value'])
                ->first();

            if (! $settingValue) {
                throw new UnivaHttpException("Недопустиме значення '{$pair['value']}' для налаштування '{$pair['key']}'.");
            }

            $upserts[] = [
                'setting_id' => $setting->id,
                'value_id' => $settingValue->id,
                'raw_value' => null,
            ];
        }

        foreach ($upserts as $upsert) {
            ApplicationUserSetting::query()->updateOrCreate(
                ['user_id' => $userId, 'application_setting_id' => $upsert['setting_id']],
                [
                    'application_setting_value_id' => $upsert['value_id'],
                    'raw_value' => $upsert['raw_value'],
                ]
            );
        }
    }

    /**
     * @throws UnivaHttpException
     */
    public function getGroupForUser(int $groupId, int $userId): array
    {
        $settings = ApplicationSetting::query()
            ->where('group_id', $groupId)
            ->with([
                'values',
                'defaultValue',
            ])
            ->orderBy('id')
            ->get();

        if ($settings->isEmpty()) {
            throw new UnivaHttpException('Групу не знайдено або вона не має налаштувань.');
        }

        $settingIds = $settings->pluck('id')->all();

        $userSettings = ApplicationUserSetting::query()
            ->where('user_id', $userId)
            ->whereIn('application_setting_id', $settingIds)
            ->get()
            ->keyBy('application_setting_id');

        return $settings->map(function (ApplicationSetting $setting) use ($userSettings) {
            $userRow = $userSettings->get($setting->id);

            $selectedValueId = $userRow?->application_setting_value_id ?? $setting->default_setting_value_id;
            $rawValue = $userRow?->raw_value;

            if ($selectedValueId !== null && $setting->values->isNotEmpty()) {
                $allowedIds = $setting->values->pluck('id')->all();

                if (! in_array($selectedValueId, $allowedIds, true)) {
                    $selectedValueId = $setting->default_setting_value_id;
                }
            }

            return [
                'id' => $setting->id,
                'group_id' => $setting->group_id,
                'key' => $setting->key,
                'type' => $setting->type,
                'label' => $setting->label,
                'description' => $setting->description,
                'constraints' => $setting->constraints,
                'selected_value_id' => $selectedValueId,
                'raw_value' => $rawValue,
                'values' => $setting->values->map(fn (ApplicationSettingValue $value) => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'label' => $value->label,
                    'meta' => $value->meta,
                    'sort_order' => $value->sort_order ?? 0,
                ])->values()->all(),
            ];
        })->values()->all();
    }

    private function usesRawValue(string $type): bool
    {
        return in_array($type, [
            SettingType::String->value,
            SettingType::Json->value,
            SettingType::Int->value,
        ], true);
    }

    /**
     * @throws UnivaHttpException
     */
    private function normalizeRawValue(string $type, string $value): string
    {
        $normalized = trim($value);

        if ($type === SettingType::Int->value) {
            if (! preg_match('/^-?\d+$/', $normalized)) {
                throw new UnivaHttpException('Значення має бути цілим числом.');
            }

            return $normalized;
        }

        if ($type === SettingType::Json->value) {
            json_decode($normalized, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new UnivaHttpException('Значення має бути коректним JSON.');
            }
        }

        return $normalized;
    }
}
