<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Ai\Models\AiContextSession;
use Illuminate\Support\Facades\Gate;

class LatestDailyDigestRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        return Gate::forUser($user)->allows('viewAny', AiContextSession::class);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'date' => $this->filled('date') ? (string) $this->input('date') : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'date' => [
                'nullable',
                'date_format:Y-m-d',
            ],
        ];
    }

    public function getDate(): ?string
    {
        $value = $this->validated('date');

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
