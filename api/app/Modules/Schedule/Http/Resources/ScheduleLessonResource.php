<?php

declare(strict_types=1);

namespace App\Modules\Schedule\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleLessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'weekday' => $this->weekday,
            'starts_at' => $this->formatTime($this->starts_at),
            'ends_at' => $this->formatTime($this->ends_at),
            'lesson_type_id' => $this->lesson_type_id,
            'delivery_mode_id' => $this->delivery_mode_id,
            'location_text' => $this->location_text,
            'note' => $this->note,
            'recurrence_rule_id' => $this->recurrence_rule_id,
            'active_from' => $this->active_from?->toDateString(),
            'active_to' => $this->active_to?->toDateString(),
            'subject' => ScheduleLessonSubjectResource::make($this->whenLoaded('subject')),
            'lesson_type' => LessonTypeResource::make($this->whenLoaded('lessonType')),
            'delivery_mode' => DeliveryModeResource::make($this->whenLoaded('deliveryMode')),
            'recurrence_rule' => RecurrenceRuleResource::make($this->whenLoaded('recurrenceRule')),
        ];
    }

    private function formatTime(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return substr($value, 0, 5);
    }
}
