<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupPollRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'allows_multiple' => ['nullable', 'boolean'],
            'is_anonymous' => ['nullable', 'boolean'],
            'show_results' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'in:open,closed'],
            'closes_at' => ['nullable', 'date'],
            'options' => ['required', 'array', 'min:2'],
            'options.*.label' => ['required', 'string', 'max:255'],
            'options.*.position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
