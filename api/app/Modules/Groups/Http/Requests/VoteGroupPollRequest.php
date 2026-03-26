<?php

namespace App\Modules\Groups\Http\Requests;

use App\Core\Request\UnivaRequest;

class VoteGroupPollRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'option_ids' => ['required', 'array', 'min:1'],
            'option_ids.*' => ['integer', 'exists:group_poll_options,id'],
        ];
    }
}
