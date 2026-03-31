<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Planner\Enums\PlannerBlockType;
use App\Modules\Planner\Enums\PlannerEnergyLevel;
use Illuminate\Validation\Rule;

class ApplyPlannerSuggestionsRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blocks' => ['required', 'array', 'min:1'],
            'blocks.*.title' => ['required', 'string', 'max:255'],
            'blocks.*.description' => ['nullable', 'string', 'max:10000'],
            'blocks.*.type' => ['required', 'string', Rule::enum(PlannerBlockType::class)],
            'blocks.*.start_at' => ['required', 'date'],
            'blocks.*.end_at' => ['required', 'date'],
            'blocks.*.subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'blocks.*.task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'blocks.*.deadline_id' => ['nullable', 'integer', 'exists:deadlines,id'],
            'blocks.*.schedule_lesson_id' => ['nullable', 'integer', 'exists:schedule_lessons,id'],
            'blocks.*.priority' => ['nullable', 'integer', 'min:0', 'max:10'],
            'blocks.*.energy_level' => ['nullable', 'string', Rule::enum(PlannerEnergyLevel::class)],
            'blocks.*.estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'blocks.*.color' => ['nullable', 'string', 'max:32'],
        ];
    }
}
