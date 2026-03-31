<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Organizer\Models\Task;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'category' => ['sometimes', 'string', Rule::in([
                Task::CATEGORY_STUDY,
                Task::CATEGORY_PERSONAL,
                Task::CATEGORY_WORK,
            ])],
            'priority' => ['sometimes', 'string', Rule::in([
                Task::PRIORITY_LOW,
                Task::PRIORITY_MEDIUM,
                Task::PRIORITY_HIGH,
                Task::PRIORITY_CRITICAL,
            ])],
            'status' => ['sometimes', 'string', Rule::in([
                Task::STATUS_TODO,
                Task::STATUS_IN_PROGRESS,
                Task::STATUS_DONE,
                Task::STATUS_CANCELLED,
            ])],
            'due_at' => ['sometimes', 'nullable', 'date'],
            'completed_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
