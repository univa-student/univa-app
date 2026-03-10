<?php

namespace App\Http\Requests\Deadlines;

use App\Models\Deadlines\Deadline;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeadlineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'type' => ['nullable', 'string', Rule::in([
                Deadline::TYPE_HOMEWORK,
                Deadline::TYPE_LAB,
                Deadline::TYPE_PRACTICE,
                Deadline::TYPE_ESSAY,
                Deadline::TYPE_PRESENTATION,
                Deadline::TYPE_MODULE,
                Deadline::TYPE_COURSEWORK,
                Deadline::TYPE_EXAM,
                Deadline::TYPE_TEST,
                Deadline::TYPE_OTHER,
            ])],
            'priority' => ['nullable', 'string', Rule::in([
                Deadline::PRIORITY_LOW,
                Deadline::PRIORITY_MEDIUM,
                Deadline::PRIORITY_HIGH,
                Deadline::PRIORITY_CRITICAL,
            ])],
            'status' => ['nullable', 'string', Rule::in([
                Deadline::STATUS_NEW,
                Deadline::STATUS_IN_PROGRESS,
                Deadline::STATUS_COMPLETED,
                Deadline::STATUS_CANCELLED,
            ])],
            'due_at' => ['required', 'date'],
            'completed_at' => ['nullable', 'date'],
        ];
    }
}
