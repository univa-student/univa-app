<?php

namespace App\Modules\Planner\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Planner\Enums\PlannerBlockStatus;
use Illuminate\Validation\Rule;

class UpdatePlannerBlockStatusRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::enum(PlannerBlockStatus::class)],
            'actual_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
        ];
    }
}
