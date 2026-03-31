<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;

class GenerateDaySuggestionsRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'include_tasks' => ['nullable', 'boolean'],
            'include_deadlines' => ['nullable', 'boolean'],
            'respect_locked_blocks' => ['nullable', 'boolean'],
            'max_blocks' => ['nullable', 'integer', 'min:1', 'max:12'],
        ];
    }
}
