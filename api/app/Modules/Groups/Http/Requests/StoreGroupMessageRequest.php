<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupMessageRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file_id' => ['nullable', 'integer', 'exists:files,id'],
            'reply_to_id' => ['nullable', 'integer', 'exists:group_messages,id'],
            'type' => ['nullable', 'string', 'in:text,file,system'],
            'content' => ['nullable', 'string'],
            'is_important' => ['nullable', 'boolean'],
            'mentions' => ['nullable', 'array'],
        ];
    }
}
