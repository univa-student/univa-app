<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Core\Request\UnivaRequest;

class ArchiveNoteRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archived' => ['required', 'boolean'],
        ];
    }
}
