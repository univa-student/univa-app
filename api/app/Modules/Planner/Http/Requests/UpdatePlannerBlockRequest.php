<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Enums\PlannerEnergyLevel;
use Illuminate\Validation\Rule;

class UpdatePlannerBlockRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'type' => ['sometimes', 'string', Rule::enum(PlannerBlockType::class)],
            'status' => ['sometimes', 'string', Rule::enum(PlannerBlockStatus::class)],
            'start_at' => ['sometimes', 'date'],
            'end_at' => ['sometimes', 'date'],
            'is_all_day' => ['sometimes', 'boolean'],
            'is_locked' => ['sometimes', 'boolean'],
            'color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'subject_id' => ['sometimes', 'nullable', 'integer', 'exists:subjects,id'],
            'task_id' => ['sometimes', 'nullable', 'integer', 'exists:tasks,id'],
            'deadline_id' => ['sometimes', 'nullable', 'integer', 'exists:deadlines,id'],
            'schedule_lesson_id' => ['sometimes', 'nullable', 'integer', 'exists:schedule_lessons,id'],
            'priority' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:10'],
            'energy_level' => ['sometimes', 'nullable', 'string', Rule::enum(PlannerEnergyLevel::class)],
            'estimated_minutes' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1440'],
            'actual_minutes' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:1440'],
            'meta' => ['sometimes', 'nullable', 'array'],
            'allow_lesson_conflict' => ['sometimes', 'boolean'],
        ];
    }
}
