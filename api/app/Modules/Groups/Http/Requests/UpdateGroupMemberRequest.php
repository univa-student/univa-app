<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class UpdateGroupMemberRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'string', 'in:owner,moderator,headman,student'],
            'status' => ['sometimes', 'string', 'in:active,invited,pending,blocked,left'],
            'nickname_in_group' => ['sometimes', 'nullable', 'string', 'max:255'],
            'subgroup' => ['sometimes', 'nullable', 'string', 'max:64'],
        ];
    }
}
