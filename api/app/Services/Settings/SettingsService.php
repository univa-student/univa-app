<?php

namespace App\Services\Settings;

use App\Enums\SettingType;
use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationSettingGroup;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * SettingsService — єдина точка доступу до налаштувань.
 *
 * ⚠ Всі звернення до налаштувань МАЮТЬ йти через цей сервіс.
 *   Прямий доступ до таблиць/моделей поза сервісом заборонений.
 *
 * Caching:
 *   - Per-group cache key: "settings.group.{groupId}"
 *   - TTL: 15 minutes
 *   - Thundering-herd protection via atomic lock
 *
 * Usage in middleware / services:
 *   $theme = app(SettingsService::class)->get('appearance.theme', 'system');
 *
 * Usage in migrations:
 *   app(SettingsService::class)->createSetting([...]);
 */
class SettingsService
{
    private const CACHE_TTL     = 900; // 15 minutes
    private const CACHE_PREFIX  = 'settings.group.';
    private const LOCK_TTL      = 5;

    // ─────────────────────────────────────────────────────────────────────────
    // Read API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get a single setting value by key.
     * Returns $default if the key does not exist.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $setting = ApplicationSetting::withoutTrashed()
            ->where('key', $key)
            ->first();

        if (!$setting) {
            return $default;
        }

        $raw = $setting->value ?? $setting->default_value;
        return $this->castValue($raw, SettingType::from($setting->type));
    }

    /**
     * Get all settings for a group, cached per group.
     * Returns a Collection of ApplicationSetting models.
     */
    public function getGroup(int $groupId): Collection
    {
        $this->assertGroupExists($groupId);

        $cacheKey = self::CACHE_PREFIX . $groupId;

        return Cache::lock("lock.{$cacheKey}", self::LOCK_TTL)
            ->block(4, function () use ($cacheKey, $groupId) {
                return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($groupId) {
                    return ApplicationSetting::withoutTrashed()
                        ->where('group_id', $groupId)
                        ->get();
                });
            });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Write API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Update the value of an existing setting by key.
     * Validates the value against type, enum options and constraints.
     */
    public function set(string $key, mixed $value): void
    {
        $setting = ApplicationSetting::withoutTrashed()
            ->where('key', $key)
            ->first();

        if (!$setting) {
            throw new DomainException("Setting with key '{$key}' does not exist.");
        }

        $type = SettingType::from($setting->type);
        $this->validateValue($value, $type, $key, $setting->enum_options, $setting->constraints);

        $setting->update([
            'value' => $this->serializeValue($value, $type),
        ]);

        $this->forgetGroupCache($setting->group_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Migration helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a new setting (idempotent — skips if key already exists).
     * Designed to be called from migrations/seeders.
     *
     * Example:
     * ```php
     * app(SettingsService::class)->createSetting([
     *     'group_id'      => ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
     *     'key'           => 'appearance.theme',
     *     'type'          => SettingType::Enum,
     *     'label'         => 'Тема',
     *     'description'   => 'Тема інтерфейсу',
     *     'default_value' => 'system',
     *     'enum_options'  => [
     *         ['value' => 'light',  'label' => 'Світла'],
     *         ['value' => 'dark',   'label' => 'Темна'],
     *         ['value' => 'system', 'label' => 'Системна'],
     *     ],
     * ]);
     * ```
     */
    public function createSetting(array|SettingDto $dto): void
    {
        if (is_array($dto)) {
            // Normalize array: convert SettingType instance or string
            if (isset($dto['type']) && $dto['type'] instanceof SettingType) {
                $dto['type'] = $dto['type']->value;
            }

            // Encode JSON columns if passed as arrays
            foreach (['enum_options', 'constraints'] as $col) {
                if (isset($dto[$col]) && is_array($dto[$col])) {
                    $dto[$col] = json_encode($dto[$col], JSON_UNESCAPED_UNICODE);
                }
            }

            // Serialize default_value
            if (array_key_exists('default_value', $dto) && $dto['default_value'] !== null) {
                $type = SettingType::from($dto['type']);
                $dto['default_value'] = $this->serializeValue($dto['default_value'], $type);
            }

            $key = $dto['key'] ?? null;
        } else {
            $key = $dto->key;
            $dto = $dto->toArray();
        }

        if (!$key) {
            throw new DomainException('Setting key is required.');
        }

        // Idempotent: skip if already exists
        if (ApplicationSetting::withoutTrashed()->where('key', $key)->exists()) {
            Log::info("SettingsService::createSetting — key '{$key}' already exists, skipping.");
            return;
        }

        ApplicationSetting::create($dto);

        $this->forgetGroupCache($dto['group_id']);
    }

    /**
     * Delete a setting by key (for use in migration down() methods).
     */
    public function deleteSetting(string $key): void
    {
        $setting = ApplicationSetting::withoutTrashed()
            ->where('key', $key)
            ->first();

        if (!$setting) {
            Log::info("SettingsService::deleteSetting — key '{$key}' not found, skipping.");
            return;
        }

        $groupId = $setting->group_id;
        $setting->forceDelete();

        $this->forgetGroupCache($groupId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cache management
    // ─────────────────────────────────────────────────────────────────────────

    public function forgetGroupCache(int $groupId): void
    {
        Cache::forget(self::CACHE_PREFIX . $groupId);
    }

    public function forgetAllCache(): void
    {
        $groupIds = [1,2,3,4,5,6,7,8,9,10,11,12];
        foreach ($groupIds as $id) {
            $this->forgetGroupCache($id);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function castValue(mixed $raw, SettingType $type): mixed
    {
        if ($raw === null) return null;

        return match ($type) {
            SettingType::Bool   => filter_var($raw, FILTER_VALIDATE_BOOLEAN),
            SettingType::Int    => (int) $raw,
            SettingType::Json   => json_decode($raw, true),
            SettingType::Enum,
            SettingType::String => (string) $raw,
        };
    }

    private function serializeValue(mixed $value, SettingType $type): string
    {
        return match ($type) {
            SettingType::Json => json_encode($value, JSON_UNESCAPED_UNICODE),
            SettingType::Bool => $value ? '1' : '0',
            default           => (string) $value,
        };
    }

    /**
     * @throws DomainException
     */
    private function validateValue(mixed $value, SettingType $type, string $key, mixed $enumOptionsJson, mixed $constraintsJson): void
    {
        match ($type) {
            SettingType::Bool => $this->assertBool($value, $key),
            SettingType::Int  => $this->assertInt($value, $key),
            SettingType::Enum => $this->assertEnum($value, $key, $enumOptionsJson),
            default           => null, // string/json — no strict validation by default
        };

        if ($constraintsJson) {
            $constraints = is_string($constraintsJson) ? json_decode($constraintsJson, true) : $constraintsJson;
            $this->applyConstraints($value, $key, $constraints ?? []);
        }
    }

    private function assertBool(mixed $value, string $key): void
    {
        if (!is_bool($value) && !in_array($value, [0, 1, '0', '1', 'true', 'false'], true)) {
            throw new DomainException("Setting '{$key}' must be a boolean value.");
        }
    }

    private function assertInt(mixed $value, string $key): void
    {
        if (!is_numeric($value)) {
            throw new DomainException("Setting '{$key}' must be an integer.");
        }
    }

    private function assertEnum(mixed $value, string $key, mixed $enumOptionsJson): void
    {
        $options = is_string($enumOptionsJson) ? json_decode($enumOptionsJson, true) : ($enumOptionsJson ?? []);
        $allowed = array_column($options, 'value');

        if (!in_array($value, $allowed, true)) {
            $list = implode(', ', $allowed);
            throw new DomainException("Setting '{$key}' must be one of: {$list}. Got: '{$value}'.");
        }
    }

    private function applyConstraints(mixed $value, string $key, array $constraints): void
    {
        if (isset($constraints['min']) && $value < $constraints['min']) {
            throw new DomainException("Setting '{$key}' must be >= {$constraints['min']}.");
        }
        if (isset($constraints['max']) && $value > $constraints['max']) {
            throw new DomainException("Setting '{$key}' must be <= {$constraints['max']}.");
        }
        if (isset($constraints['regex']) && !preg_match($constraints['regex'], (string) $value)) {
            throw new DomainException("Setting '{$key}' does not match the required format.");
        }
    }

    private function assertGroupExists(int $groupId): void
    {
        if (!ApplicationSettingGroup::withoutTrashed()->where('id', $groupId)->exists()) {
            throw new DomainException("Settings group with ID {$groupId} does not exist.");
        }
    }
}
