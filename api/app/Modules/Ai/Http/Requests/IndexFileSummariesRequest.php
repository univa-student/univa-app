<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Ai\Models\AiContextSession;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class IndexFileSummariesRequest extends UnivaRequest
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
            'file_id' => $this->filled('file_id') ? (int) $this->input('file_id') : null,
            'session_id' => $this->filled('session_id') ? (int) $this->input('session_id') : null,
            'per_page' => $this->filled('per_page') ? (int) $this->input('per_page') : 15,
        ]);
    }

    public function rules(): array
    {
        return [
            'file_id' => [
                'nullable',
                'integer',
                Rule::exists('files', 'id'),
            ],
            'session_id' => [
                'nullable',
                'integer',
                Rule::exists('ai_context_sessions', 'id'),
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }

    public function fileId(): ?int
    {
        $value = $this->validated('file_id');

        return $value !== null ? (int) $value : null;
    }

    public function sessionId(): ?int
    {
        $value = $this->validated('session_id');

        return $value !== null ? (int) $value : null;
    }

    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? 15);
    }
}
