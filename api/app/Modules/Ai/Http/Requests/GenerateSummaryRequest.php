<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSummaryStyle;
use App\Modules\Files\Models\File;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class GenerateSummaryRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        $fileIds = $this->resolveFileIds();

        if ($fileIds === []) {
            return false;
        }

        $files = File::query()
            ->whereIn('id', $fileIds)
            ->get();

        if ($files->count() !== count($fileIds)) {
            return false;
        }

        foreach ($files as $file) {
            if (!Gate::forUser($user)->allows('view', $file)) {
                return false;
            }
        }

        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'file_ids' => $this->resolveFileIds(),
            'mode' => AiSessionMode::SUMMARY->value,
        ]);
    }

    public function rules(): array
    {
        return [
            'file_ids' => [
                'required',
                'array',
                'min:1',
                'max:8',
            ],
            'file_ids.*' => [
                'required',
                'integer',
                Rule::exists('files', 'id'),
                'distinct',
            ],
            'session_id' => [
                'nullable',
                'integer',
                Rule::exists('ai_context_sessions', 'id'),
            ],
            'mode' => [
                'required',
                Rule::in([AiSessionMode::SUMMARY->value]),
            ],
            'language' => [
                'nullable',
                'string',
                'max:10',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'force_refresh' => [
                'nullable',
                'boolean',
            ],
            'model' => [
                'nullable',
                'string',
                'max:100',
            ],
            'style' => [
                'nullable',
                Rule::in(AiSummaryStyle::values()),
            ],
            'include_flashcards' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    public function toDto(): SummarizeFileData
    {
        $validated = $this->validated();

        return SummarizeFileData::fromArray([
            'user_id' => (int) $this->user()->getAuthIdentifier(),
            'file_ids' => array_map('intval', $validated['file_ids'] ?? []),
            'mode' => AiSessionMode::SUMMARY,
            'session_id' => isset($validated['session_id']) ? (int) $validated['session_id'] : null,
            'language' => isset($validated['language']) ? (string) $validated['language'] : null,
            'notes' => isset($validated['notes']) ? (string) $validated['notes'] : null,
            'force_refresh' => (bool) ($validated['force_refresh'] ?? false),
            'model' => isset($validated['model']) ? (string) $validated['model'] : null,
            'style' => isset($validated['style']) ? (string) $validated['style'] : AiSummaryStyle::STANDARD->value,
            'include_flashcards' => (bool) ($validated['include_flashcards'] ?? false),
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function resolveFileIds(): array
    {
        $raw = $this->input('file_ids', []);

        if (!is_array($raw)) {
            return [];
        }

        return array_values(array_map('intval', array_filter(
            $raw,
            static fn (mixed $value): bool => is_numeric($value),
        )));
    }
}
