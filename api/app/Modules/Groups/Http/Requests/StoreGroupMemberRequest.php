<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupMemberRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role' => ['nullable', 'string', 'in:owner,moderator,headman,student'],
            'status' => ['nullable', 'string', 'in:active,invited,pending,blocked,left'],
            'nickname_in_group' => ['nullable', 'string', 'max:255'],
            'subgroup' => ['nullable', 'string', 'max:64'],
        ];
    }
}
