<?php

declare(strict_types=1);

namespace App\Modules\Ai\Formatters;

use App\Modules\Ai\Contracts\ArtifactFormatterContract;
use App\Modules\Ai\DTO\FileSummaryContextData;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\DTO\SummaryArtifactData;
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
        if (!$context instanceof FileSummaryContextData) {
            throw AiContextException::invalidDto(
                FileSummaryContextData::class,
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
        FileSummaryContextData $context,
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

        $contentText = $this->buildContentText(
            title: $title,
            shortSummary: $shortSummary,
            mainPoints: $mainPoints,
            keyTerms: $keyTerms,
            possibleQuestions: $possibleQuestions,
        );

        return new SummaryArtifactData(
            title: $title,
            shortSummary: $shortSummary,
            mainPoints: $mainPoints,
            keyTerms: $keyTerms,
            possibleQuestions: $possibleQuestions,
            contentText: $contentText,
            meta: [
                'file_id' => $context->fileId,
                'file_name' => $context->fileName,
                'subject_id' => $context->subjectId,
                'subject_name' => $context->subjectName,
                'language' => $context->language ?? $input?->language,
                'mode' => $input?->mode->value,
                'source' => 'ai',
            ],
        );
    }

    /**
     * @param array<string, mixed> $structured
     */
    private function resolveTitle(array $structured, FileSummaryContextData $context): string
    {
        $title = $structured['title'] ?? null;

        if (is_string($title) && trim($title) !== '') {
            return trim($title);
        }

        return 'Конспект: ' . $context->fileName;
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
     * @param mixed $value
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

    /**
     * @param array<int, string> $mainPoints
     * @param array<int, string> $keyTerms
     * @param array<int, string> $possibleQuestions
     */
    private function buildContentText(
        string $title,
        ?string $shortSummary,
        array $mainPoints,
        array $keyTerms,
        array $possibleQuestions,
    ): string {
        $parts = [$title];

        if ($shortSummary !== null && trim($shortSummary) !== '') {
            $parts[] = $shortSummary;
        }

        if ($mainPoints !== []) {
            $lines = ['Основні думки:'];

            foreach ($mainPoints as $point) {
                $lines[] = '- ' . $point;
            }

            $parts[] = implode(PHP_EOL, $lines);
        }

        if ($keyTerms !== []) {
            $parts[] = 'Ключові терміни: ' . implode(', ', $keyTerms);
        }

        if ($possibleQuestions !== []) {
            $lines = ['Можливі запитання:'];

            foreach ($possibleQuestions as $question) {
                $lines[] = '- ' . $question;
            }

            $parts[] = implode(PHP_EOL, $lines);
        }

        return implode(PHP_EOL . PHP_EOL, array_filter($parts));
    }
}
