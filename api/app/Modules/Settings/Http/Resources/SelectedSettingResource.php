<?php

namespace App\Modules\Settings\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SelectedSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $setting = $this->setting;
        $value = $this->value;
        $rawValue = $this->raw_value;

        return [
            'id' => $this->id,

            'setting' => [
                'id' => $setting->id,
                'key' => $setting->key,
                'type' => $setting->type,
                'label' => $setting->label,
                'description' => $setting->description,
                'defaultValueId' => $setting->default_setting_value_id,
            ],

            'value' => [
                'id' => $value?->id,
                'value' => $value?->value ?? $rawValue,
                'label' => $value?->label,
                'meta' => $value?->meta,
            ],
            'rawValue' => $rawValue,
        ];
    }
}
