<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupAnnouncementRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_channel_id' => ['nullable', 'integer', 'exists:group_channels,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'type' => ['nullable', 'string', 'in:academic,organizational,headman,teacher,system'],
            'is_pinned' => ['nullable', 'boolean'],
            'requires_acknowledgement' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'deadline_at' => ['nullable', 'date'],
            'file_ids' => ['nullable', 'array'],
            'file_ids.*' => ['integer', 'exists:files,id'],
        ];
    }
}
