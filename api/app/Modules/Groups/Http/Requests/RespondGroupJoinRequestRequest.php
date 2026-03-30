<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class RespondGroupJoinRequestRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:approved,rejected'],
        ];
    }
}
