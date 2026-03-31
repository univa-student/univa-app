<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Core\Request\UnivaRequest;
use Illuminate\Validation\Rule;

class StoreNoteRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'body_markdown' => ['required', 'string', 'max:50000'],
            'subject_id' => [
                'nullable',
                'integer',
                Rule::exists('subjects', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'task_ids' => ['nullable', 'array'],
            'task_ids.*' => [
                'integer',
                Rule::exists('tasks', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
        ];
    }
}
