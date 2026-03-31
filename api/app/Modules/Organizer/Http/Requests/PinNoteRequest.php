<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Core\Request\UnivaRequest;

class PinNoteRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_pinned' => ['required', 'boolean'],
        ];
    }
}
