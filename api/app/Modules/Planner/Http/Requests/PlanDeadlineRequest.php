<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Planner\Enums\PlannerEnergyLevel;
use Illuminate\Validation\Rule;

class PlanDeadlineRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blocks' => ['nullable', 'array', 'min:1'],
            'blocks.*.title' => ['nullable', 'string', 'max:255'],
            'blocks.*.description' => ['nullable', 'string', 'max:10000'],
            'blocks.*.start_at' => ['required_with:blocks', 'date'],
            'blocks.*.end_at' => ['required_with:blocks', 'date'],
            'blocks.*.subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'blocks.*.schedule_lesson_id' => ['nullable', 'integer', 'exists:schedule_lessons,id'],
            'blocks.*.priority' => ['nullable', 'integer', 'min:0', 'max:10'],
            'blocks.*.energy_level' => ['nullable', 'string', Rule::enum(PlannerEnergyLevel::class)],
            'blocks.*.estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'blocks.*.color' => ['nullable', 'string', 'max:32'],
            'blocks.*.is_locked' => ['nullable', 'boolean'],
            'start_at' => ['required_without:blocks', 'date'],
            'end_at' => ['required_without:blocks', 'date'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
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
