<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;

class ResizePlannerBlockRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date'],
            'allow_lesson_conflict' => ['nullable', 'boolean'],
        ];
    }
}
