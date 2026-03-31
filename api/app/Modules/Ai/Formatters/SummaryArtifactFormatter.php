<?php

declare(strict_types=1);

namespace App\Modules\Ai\Formatters;

use App\Modules\Ai\Contracts\ArtifactFormatterContract;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\DTO\SummaryArtifactData;
use App\Modules\Ai\DTO\SummaryContextData;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Exceptions\AiProviderException;
use App\Modules\Ai\Support\AiResponseExtractor;

final readonly class SummaryArtifactFormatter implements ArtifactFormatterContract
{
    public function __construct(
        private AiResponseExtractor $responseExtractor,
    ) {
    }

    /**
     * @throws AiContextException
     * @throws AiProviderException
     */
    public function format(mixed $response, object $context, ?object $input = null): object
    {
        if (!$context instanceof SummaryContextData) {
            throw AiContextException::invalidDto(
                SummaryContextData::class,
                get_debug_type($context),
            );
        }

        if ($input !== null && !$input instanceof SummarizeFileData) {
            throw AiContextException::invalidDto(
                SummarizeFileData::class,
                get_debug_type($input),
            );
        }

        return $this->formatSummary($response, $context, $input);
    }

    /**
     * @throws AiProviderException
     */
    public function formatSummary(
        mixed $response,
        SummaryContextData $context,
        ?SummarizeFileData $input = null,
    ): SummaryArtifactData {
        $provider = 'unknown';

        if ($input?->model !== null && trim($input->model) !== '') {
            $provider = $input->model;
        }

        $structured = $this->responseExtractor->extractStructured($response, $provider);

        $title = $this->resolveTitle($structured, $context);
        $shortSummary = $this->resolveShortSummary($structured);
        $mainPoints = $this->normalizeStringList($structured['main_points'] ?? []);
        $keyTerms = $this->normalizeStringList($structured['key_terms'] ?? []);
        $possibleQuestions = $this->normalizeStringList($structured['possible_questions'] ?? []);
        $flashcards = $structured['flashcards'] ?? [];

        $artifact = SummaryArtifactData::fromArray([
            'title' => $title,
            'short_summary' => $shortSummary,
            'main_points' => $mainPoints,
            'key_terms' => $keyTerms,
            'possible_questions' => $possibleQuestions,
            'flashcards' => $flashcards,
            'meta' => [
                'file_ids' => $context->fileIds(),
                'file_names' => $context->fileNames(),
                'source_files' => array_map(
                    static fn ($file): array => [
                        'id' => $file->fileId,
                        'name' => $file->fileName,
                        'subject_id' => $file->subjectId,
                        'subject_name' => $file->subjectName,
                    ],
                    $context->files,
                ),
                'subject_id' => $context->subjectId,
                'subject_name' => $context->subjectName,
                'language' => $context->language ?? $input?->language,
                'mode' => $input?->mode->value,
                'style' => $input?->style->value,
                'include_flashcards' => $input?->includeFlashcards ?? false,
                'source' => 'ai',
                'is_multi_file' => $context->isMultiFile(),
            ],
            'style' => $input?->style?->value,
        ]);

        return new SummaryArtifactData(
            title: $artifact->title,
            shortSummary: $artifact->shortSummary,
            mainPoints: $artifact->mainPoints,
            keyTerms: $artifact->keyTerms,
            possibleQuestions: $artifact->possibleQuestions,
            flashcards: $artifact->flashcards,
            contentText: $this->buildContentText($artifact),
            meta: $artifact->meta,
            style: $artifact->style,
        );
    }

    /**
     * @param array<string, mixed> $structured
     */
    private function resolveTitle(array $structured, SummaryContextData $context): string
    {
        $title = $structured['title'] ?? null;

        if (is_string($title) && trim($title) !== '') {
            return trim($title);
        }

        return 'Конспект: ' . $context->displayName();
    }

    /**
     * @param array<string, mixed> $structured
     */
    private function resolveShortSummary(array $structured): ?string
    {
        $value = $structured['short_summary'] ?? null;

        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $items = [];

        foreach ($value as $item) {
            if (is_string($item) && trim($item) !== '') {
                $items[] = trim($item);
            }
        }

        return array_values($items);
    }

    private function buildContentText(SummaryArtifactData $artifact): string
    {
        return $artifact->toContentText();
    }
}
