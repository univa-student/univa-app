<?php

declare(strict_types=1);

namespace App\Modules\Ai\Agents;

use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\DTO\SummaryContextData;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Prompts\FileSummary\OutputRulesPrompt;
use App\Modules\Ai\Prompts\FileSummary\SystemPrompt;
use DomainException;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files;
use Laravel\Ai\Files\LocalDocument;
use Laravel\Ai\Files\StoredDocument;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;
use Stringable;

#[Provider(Lab::Gemini)]
#[MaxTokens(8192)]
#[Temperature(0.2)]
#[Timeout(120)]
final class FileSummaryAgent implements Agent, HasStructuredOutput, HasProviderOptions
{
    use Promptable;

    private ?SummaryContextData $context = null;
    private ?SummarizeFileData $input = null;

    /**
     * @throws AiContextException
     */
    public function instructions(): Stringable|string
    {
        if (!$this->context instanceof SummaryContextData) {
            throw AiContextException::emptyContext('file');
        }

        return trim(
            SystemPrompt::build($this->context, $this->input) . PHP_EOL . PHP_EOL .
            OutputRulesPrompt::build()
        );
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->required(),
            'short_summary' => $schema->string(),
            'main_points' => $schema->array()->items($schema->string())->required(),
            'key_terms' => $schema->array()->items($schema->string())->required(),
            'possible_questions' => $schema->array()->items($schema->string())->required(),
            'flashcards' => $schema->array()->items(
                $schema->object(
                    properties: [
                        'question' => $schema->string()->required(),
                        'answer' => $schema->string()->required(),
                    ],
                ),
            )->required(),
        ];
    }

    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::Gemini => [
                'thinking' => ['budget_tokens' => 0],
            ],
            Lab::OpenAI => [
                'reasoning' => ['effort' => 'low'],
            ],
            Lab::Anthropic => [
                'thinking' => ['budget_tokens' => 1024],
            ],
            default => [],
        };
    }

    /**
     * @param array<int, array{
     *     disk: string,
     *     path: string,
     *     absolute_path: string|null,
     *     file_name: string,
     *     mime_type: string|null,
     *     extension: string|null,
     *     size: int|null
     * }> $attachments
     */
    public function summarize(
        SummaryContextData $context,
        array $attachments,
        AiProvider $provider,
        string $model,
        ?SummarizeFileData $input = null,
        ?AiContextSession $session = null,
    ): AgentResponse {
        $this->context = $context;
        $this->input = $input;

        return $this->prompt(
            $this->buildPrompt($context, $input),
            attachments: array_map(
                fn (array $attachment): LocalDocument|StoredDocument => $this->toDocumentAttachment($attachment),
                $attachments,
            ),
            provider: $this->toLab($provider),
            model: $model,
        );
    }

    private function buildPrompt(
        SummaryContextData $context,
        ?SummarizeFileData $input = null,
    ): string {
        $language = $input?->language ?? $context->language ?? 'uk';
        $fileCount = count($context->files);
        $sourceSummaries = $this->compactSourceSummaries($context->extra['source_summaries'] ?? null);

        $lines = [
            'Створи один структурований навчальний конспект.',
            'Мова відповіді: ' . $language,
            'Кількість матеріалів: ' . $fileCount,
        ];

        if ($sourceSummaries !== []) {
            $lines[] = 'Нижче вже є проміжні конспекти по частинах. Використай їх як джерело для фінального зведення.';
            $lines[] = 'Проміжні конспекти: ' . json_encode($sourceSummaries, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        if ($input?->notes !== null && trim($input->notes) !== '') {
            $lines[] = 'Додаткові побажання: ' . trim($input->notes);
        }

        $lines[] = 'Поверни тільки дані за схемою.';

        return implode(PHP_EOL, $lines);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function compactSourceSummaries(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_map(
            static function (mixed $summary): array {
                if (!is_array($summary)) {
                    return [];
                }

                return [
                    'title' => $summary['title'] ?? null,
                    'files' => array_slice(is_array($summary['files'] ?? null) ? $summary['files'] : [], 0, 3),
                    'short_summary' => $summary['short_summary'] ?? null,
                    'main_points' => array_slice(is_array($summary['main_points'] ?? null) ? $summary['main_points'] : [], 0, 4),
                    'key_terms' => array_slice(is_array($summary['key_terms'] ?? null) ? $summary['key_terms'] : [], 0, 4),
                ];
            },
            array_filter($value, static fn (mixed $summary): bool => is_array($summary)),
        ));
    }

    /**
     * @param array{
     *     disk: string,
     *     path: string,
     *     absolute_path: string|null,
     *     file_name: string,
     *     mime_type: string|null,
     *     extension: string|null,
     *     size: int|null
     * } $attachment
     */
    private function toDocumentAttachment(array $attachment): LocalDocument|StoredDocument
    {
        $absolutePath = $attachment['absolute_path'] ?? null;
        $path = $attachment['path'] ?? null;
        $disk = $attachment['disk'] ?? null;

        if (is_string($absolutePath) && trim($absolutePath) !== '') {
            return Files\Document::fromPath($absolutePath);
        }

        if (is_string($path) && trim($path) !== '') {
            if (is_string($disk) && trim($disk) !== '') {
                return Files\Document::fromStorage($path, disk: $disk);
            }

            return Files\Document::fromStorage($path);
        }

        throw new DomainException('Не вдалося підготувати AI attachment для документа.');
    }

    private function toLab(AiProvider $provider): Lab
    {
        return match ($provider) {
            AiProvider::GEMINI => Lab::Gemini,
            AiProvider::OPENAI => Lab::OpenAI,
            AiProvider::ANTHROPIC => Lab::Anthropic,
        };
    }
}
