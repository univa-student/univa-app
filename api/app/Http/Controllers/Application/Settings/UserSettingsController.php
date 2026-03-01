<?php

namespace App\Http\Controllers\Application\Settings;

use App\Core\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Application\Settings\ApplicationSetting;
use App\Models\Application\Settings\ApplicationSettingGroup;
use App\Models\Application\Settings\ApplicationSettingValue;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class UserSettingsController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $settings = ApplicationSetting::query()
            ->with(['value', 'group'])
            ->where('user_id', $user->id)
            ->get();

        $payload = $this->mapSettingsToPayload($settings);

        return ApiResponse::success('User settings', $payload);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $data = $request->validate([
            'theme' => ['nullable', 'string'],
            'language' => ['nullable', 'string'],
            'compact' => ['nullable', 'boolean'],
            'animations' => ['nullable', 'boolean'],
        ]);

        $valueMap = $this->getValueMap();

        $this->upsertSetting(
            $user->id,
            'theme',
            'Тема',
            ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            $data['theme'] ?? null,
            $valueMap
        );

        $this->upsertSetting(
            $user->id,
            'language',
            'Мова інтерфейсу',
            ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            $data['language'] ?? null,
            $valueMap
        );

        $this->upsertSetting(
            $user->id,
            'compact',
            'Компактний режим',
            ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            isset($data['compact']) ? ($data['compact'] ? ApplicationSettingValue::ENABLED : ApplicationSettingValue::DISABLED) : null,
            $valueMap
        );

        $this->upsertSetting(
            $user->id,
            'animations',
            'Анімації',
            ApplicationSettingGroup::APPEARANCE_SETTINGS_GROUP_ID,
            isset($data['animations']) ? ($data['animations'] ? ApplicationSettingValue::ENABLED : ApplicationSettingValue::DISABLED) : null,
            $valueMap
        );

        $settings = ApplicationSetting::query()
            ->with(['value', 'group'])
            ->where('user_id', $user->id)
            ->get();

        $payload = $this->mapSettingsToPayload($settings);

        return ApiResponse::success('User settings updated', $payload);
    }

    private function getValueMap(): Collection
    {
        /** @var \Illuminate\Support\Collection $values */
        $values = ApplicationSettingValue::query()->get();

        return $values->keyBy('option_name');
    }

    private function upsertSetting(
        int $userId,
        string $key,
        string $name,
        int $groupId,
        ?string $optionName,
        Collection $valueMap
    ): void {
        if ($optionName === null) {
            return;
        }

        $value = $valueMap->get($optionName);

        if (! $value) {
            return;
        }

        ApplicationSetting::updateOrCreate(
            [
                'user_id' => $userId,
                'key' => $key,
            ],
            [
                'name' => $name,
                'application_setting_group_id' => $groupId,
                'application_setting_value_id' => $value->id,
            ]
        );
    }

    private function mapSettingsToPayload(Collection $settings): array
    {
        $byKey = $settings->keyBy('key');

        $get = static function (string $key) use ($byKey): ?string {
            $setting = $byKey->get($key);

            if (! $setting || ! $setting->value) {
                return null;
            }

            return $setting->value->option_name;
        };

        return [
            'theme' => $get('theme') ?? ApplicationSettingValue::THEME_SYSTEM,
            'language' => $get('language') ?? ApplicationSettingValue::LANG_AUTO,
            'compact' => $get('compact') ? $get('compact') === ApplicationSettingValue::ENABLED : false,
            'animations' => $get('animations') ? $get('animations') === ApplicationSettingValue::ENABLED : true,
        ];
    }
}

