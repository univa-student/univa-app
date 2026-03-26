<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupChannelRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_subject_id' => ['nullable', 'integer', 'exists:group_subjects,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'in:general,announcements,subject,custom'],
            'description' => ['nullable', 'string'],
        ];
    }
}
