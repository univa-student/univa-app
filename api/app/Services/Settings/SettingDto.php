<?php

namespace App\Services\Settings;

use App\Enums\SettingType;
use App\Models\Application\Settings\ApplicationSettingGroup;

/**
 * Immutable data-transfer object for creating a setting.
 * Used in migrations / seeders via SettingsService::createSetting().
 */
final class SettingDto
{
    public function __construct(
        public readonly int         $groupId,
        public readonly string      $key,
        public readonly SettingType $type,
        public readonly string      $label,
        public readonly mixed       $defaultValue = null,
        public readonly ?string     $description  = null,
        public readonly ?array      $enumOptions  = null,   // [['value'=>'light','label'=>'Світла'], ...]
        public readonly ?array      $constraints  = null,   // ['min'=>0,'max'=>100] / ['regex'=>'...']
    ) {
        // Validate groupId is one of the known constants
        $validGroupIds = [
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
        ];

        if (!in_array($groupId, $validGroupIds, true)) {
            throw new \DomainException("Unknown settings group ID: {$groupId}");
        }

        if ($type === SettingType::Enum && empty($enumOptions)) {
            throw new \DomainException("Setting type 'enum' requires enumOptions to be provided (key: {$key}).");
        }
    }

    public function toArray(): array
    {
        return [
            'group_id'      => $this->groupId,
            'key'           => $this->key,
            'type'          => $this->type->value,
            'label'         => $this->label,
            'default_value' => $this->serializeValue($this->defaultValue),
            'description'   => $this->description,
            'enum_options'  => $this->enumOptions !== null ? json_encode($this->enumOptions, JSON_UNESCAPED_UNICODE) : null,
            'constraints'   => $this->constraints  !== null ? json_encode($this->constraints,  JSON_UNESCAPED_UNICODE) : null,
        ];
    }

    private function serializeValue(mixed $value): ?string
    {
        if ($value === null) return null;

        return match ($this->type) {
            SettingType::Json => json_encode($value, JSON_UNESCAPED_UNICODE),
            SettingType::Bool => $value ? '1' : '0',
            default           => (string) $value,
        };
    }
}
