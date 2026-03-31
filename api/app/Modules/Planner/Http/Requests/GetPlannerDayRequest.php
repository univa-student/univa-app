<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;

class GetPlannerDayRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
        ];
    }
}
