<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms a single ApplicationSetting model into the API response shape.
 *
 * Shape:
 * {
 *   "key":          "appearance.theme",
 *   "type":         "enum",
 *   "label":        "Тема",
 *   "description":  "Тема інтерфейсу",
 *   "value":        "system",
 *   "enumOptions":  [{"value":"light","label":"Світла"}, ...],
 *   "constraints":  null
 * }
 */
class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'key'         => $this->key,
            'type'        => $this->type,
            'label'       => $this->label,
            'description' => $this->description,
            'value'       => $this->resolvedValue(),
            'enumOptions' => $this->enum_options,
            'constraints' => $this->constraints,
        ];
    }

    /**
     * Returns value if explicitly set, otherwise falls back to default_value.
     */
    private function resolvedValue(): mixed
    {
        $raw = $this->value ?? $this->default_value;

        return match ($this->type) {
            'bool' => filter_var($raw, FILTER_VALIDATE_BOOLEAN),
            'int'  => $raw !== null ? (int) $raw : null,
            'json' => $raw !== null ? json_decode($raw, true) : null,
            default => $raw,
        };
    }
}
