<?php

declare(strict_types=1);

namespace App\Modules\Profiles\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Profiles\DTO\SelectUniversityData;

class SelectUniversityRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'id' => [
                'required',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'id.required' => 'Оберіть університет.',
        ];
    }

    public function toDto(): SelectUniversityData
    {
        return new SelectUniversityData(
            universityId: $this->validated('id'),
        );
    }
}
