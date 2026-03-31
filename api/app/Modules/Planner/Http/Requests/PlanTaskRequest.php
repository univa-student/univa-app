<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Planner\Enums\PlannerEnergyLevel;
use Illuminate\Validation\Rule;

class PlanTaskRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'schedule_lesson_id' => ['nullable', 'integer', 'exists:schedule_lessons,id'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:10'],
            'energy_level' => ['nullable', 'string', Rule::enum(PlannerEnergyLevel::class)],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'color' => ['nullable', 'string', 'max:32'],
            'is_locked' => ['nullable', 'boolean'],
            'allow_lesson_conflict' => ['nullable', 'boolean'],
        ];
    }
}
