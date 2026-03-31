<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Enums\PlannerEnergyLevel;
use Illuminate\Validation\Rule;

class CreatePlannerBlockRequest extends UnivaRequest
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
            'type' => ['required', 'string', Rule::enum(PlannerBlockType::class)],
            'status' => ['nullable', 'string', Rule::enum(PlannerBlockStatus::class)],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date'],
            'is_all_day' => ['nullable', 'boolean'],
            'is_locked' => ['nullable', 'boolean'],
            'color' => ['nullable', 'string', 'max:32'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'deadline_id' => ['nullable', 'integer', 'exists:deadlines,id'],
            'schedule_lesson_id' => ['nullable', 'integer', 'exists:schedule_lessons,id'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:10'],
            'energy_level' => ['nullable', 'string', Rule::enum(PlannerEnergyLevel::class)],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'actual_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'meta' => ['nullable', 'array'],
            'allow_lesson_conflict' => ['nullable', 'boolean'],
        ];
    }
}
