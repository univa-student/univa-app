<?php

namespace App\Modules\Planner\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlannerBlockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type?->value,
            'status' => $this->status?->value,
            'start_at' => $this->start_at?->toISOString(),
            'end_at' => $this->end_at?->toISOString(),
            'date' => $this->date?->toDateString(),
            'is_all_day' => $this->is_all_day,
            'is_locked' => $this->is_locked,
            'created_by_ai' => $this->created_by_ai,
            'color' => $this->color,
            'source_type' => $this->source_type?->value,
            'source_id' => $this->source_id,
            'subject_id' => $this->subject_id,
            'task_id' => $this->task_id,
            'deadline_id' => $this->deadline_id,
            'schedule_lesson_id' => $this->schedule_lesson_id,
            'priority' => $this->priority,
            'estimated_minutes' => $this->estimated_minutes,
            'actual_minutes' => $this->actual_minutes,
            'energy_level' => $this->energy_level?->value,
            'meta' => $this->meta,
            'subject' => $this->whenLoaded('subject', function (): ?array {
                if ($this->subject === null) {
                    return null;
                }

                return [
                    'id' => $this->subject->id,
                    'name' => $this->subject->name,
                    'color' => $this->subject->color,
                ];
            }),
            'task' => $this->whenLoaded('task', function (): ?array {
                if ($this->task === null) {
                    return null;
                }

                return [
                    'id' => $this->task->id,
                    'title' => $this->task->title,
                    'status' => $this->task->status,
                    'priority' => $this->task->priority,
                ];
            }),
            'deadline' => $this->whenLoaded('deadline', function (): ?array {
                if ($this->deadline === null) {
                    return null;
                }

                return [
                    'id' => $this->deadline->id,
                    'title' => $this->deadline->title,
                    'status' => $this->deadline->status,
                    'priority' => $this->deadline->priority,
                    'due_at' => $this->deadline->due_at?->toISOString(),
                ];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
