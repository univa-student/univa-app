<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class UpdateGroupAnnouncementRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_channel_id' => ['sometimes', 'nullable', 'integer', 'exists:group_channels,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'type' => ['sometimes', 'string', 'in:academic,organizational,headman,teacher,system'],
            'is_pinned' => ['sometimes', 'boolean'],
            'requires_acknowledgement' => ['sometimes', 'boolean'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'ends_at' => ['sometimes', 'nullable', 'date'],
            'deadline_at' => ['sometimes', 'nullable', 'date'],
            'file_ids' => ['sometimes', 'array'],
            'file_ids.*' => ['integer', 'exists:files,id'],
        ];
    }
}
