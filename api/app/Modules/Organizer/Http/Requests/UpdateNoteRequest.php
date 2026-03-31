<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Core\Request\UnivaRequest;
use Illuminate\Validation\Rule;

class UpdateNoteRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'body_markdown' => ['sometimes', 'string', 'max:50000'],
            'subject_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('subjects', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'task_ids' => ['sometimes', 'array'],
            'task_ids.*' => [
                'integer',
                Rule::exists('tasks', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
        ];
    }
}
