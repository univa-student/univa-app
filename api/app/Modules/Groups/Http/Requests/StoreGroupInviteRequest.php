<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class StoreGroupInviteRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'max_uses' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'expires_at' => ['nullable', 'date'],
        ];
    }
}
