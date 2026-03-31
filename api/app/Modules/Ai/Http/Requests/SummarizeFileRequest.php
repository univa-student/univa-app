<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Requests;

use App\Core\Request\UnivaRequest;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Files\Models\File;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SummarizeFileRequest extends UnivaRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        $file = $this->resolveFile();

        if (! $file instanceof File) {
            return false;
        }

        return Gate::forUser($user)->allows('view', $file);
    }

    protected function prepareForValidation(): void
    {
        $fileId = $this->resolveFileId();

        if ($fileId !== null) {
            $this->merge([
                'file_id' => $fileId,
            ]);
        }

        $this->merge([
            'mode' => AiSessionMode::SUMMARY->value,
        ]);
    }

    public function rules(): array
    {
        return [
            'file_id' => [
                'required',
                'integer',
                Rule::exists('files', 'id'),
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
        ];
    }

    public function messages(): array
    {
        return [
            'file_id.required' => 'Необхідно вказати файл.',
            'file_id.integer' => 'Ідентифікатор файла має бути числом.',
            'file_id.exists' => 'Вказаний файл не знайдено.',

            'session_id.integer' => 'Ідентифікатор AI-сесії має бути числом.',
            'session_id.exists' => 'Вказану AI-сесію не знайдено.',

            'mode.required' => 'Режим AI-запиту є обов’язковим.',
            'mode.in' => 'Для цього ендпойнта доступний лише режим summary.',

            'language.string' => 'Мова відповіді має бути рядком.',
            'language.max' => 'Поле мови має бути не довше 10 символів.',

            'notes.string' => 'Додаткові побажання мають бути рядком.',
            'notes.max' => 'Додаткові побажання не можуть бути довшими за 2000 символів.',

            'force_refresh.boolean' => 'Поле force_refresh повинно бути true або false.',

            'model.string' => 'Назва моделі має бути рядком.',
            'model.max' => 'Назва моделі не може бути довшою за 100 символів.',
        ];
    }

    public function attributes(): array
    {
        return [
            'file_id' => 'файл',
            'session_id' => 'AI-сесія',
            'mode' => 'режим',
            'language' => 'мова',
            'notes' => 'додаткові побажання',
            'force_refresh' => 'оновлення результату',
            'model' => 'модель',
        ];
    }

    public function toDto(): SummarizeFileData
    {
        $validated = $this->validated();

        return new SummarizeFileData(
            userId: (int) $this->user()->getAuthIdentifier(),
            fileId: (int) $validated['file_id'],
            mode: AiSessionMode::SUMMARY,
            sessionId: isset($validated['session_id']) ? (int) $validated['session_id'] : null,
            language: isset($validated['language']) ? (string) $validated['language'] : null,
            notes: isset($validated['notes']) ? (string) $validated['notes'] : null,
            forceRefresh: (bool) ($validated['force_refresh'] ?? false),
            model: isset($validated['model']) ? (string) $validated['model'] : null,
        );
    }

    private function resolveFile(): ?File
    {
        $routeFile = $this->route('file');

        if ($routeFile instanceof File) {
            return $routeFile;
        }

        $fileId = $this->resolveFileId();

        if ($fileId === null) {
            return null;
        }

        return File::query()->find($fileId);
    }

    private function resolveFileId(): ?int
    {
        $routeFile = $this->route('file');

        if ($routeFile instanceof File) {
            return (int) $routeFile->getKey();
        }

        if (is_numeric($routeFile)) {
            return (int) $routeFile;
        }

        $inputFileId = $this->input('file_id');

        if (is_numeric($inputFileId)) {
            return (int) $inputFileId;
        }

        return null;
    }
}
