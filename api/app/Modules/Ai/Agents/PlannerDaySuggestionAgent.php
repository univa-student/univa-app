<?php

declare(strict_types=1);

namespace App\Modules\Ai\Agents;

use App\Modules\Ai\DTO\GeneratePlannerDaySuggestionsData;
use App\Modules\Ai\DTO\PlannerDaySuggestionContextData;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Prompts\PlannerDaySuggestions\OutputRulesPrompt;
use App\Modules\Ai\Prompts\PlannerDaySuggestions\SystemPrompt;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;
use Stringable;

#[Provider(Lab::Gemini)]
#[MaxTokens(8192)]
#[Temperature(0.2)]
#[Timeout(120)]
final class PlannerDaySuggestionAgent implements Agent, HasStructuredOutput, HasProviderOptions
{
    use Promptable;

    private ?PlannerDaySuggestionContextData $context = null;

    /**
     * @throws AiContextException
     */
    public function instructions(): Stringable|string
    {
        if (!$this->context instanceof PlannerDaySuggestionContextData) {
            throw AiContextException::emptyContext('planner_day_suggestions');
        }

        return trim(
            SystemPrompt::build($this->context) . PHP_EOL . PHP_EOL .
            OutputRulesPrompt::build(),
        );
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'summary' => $schema->string()->required(),
            'blocks' => $schema->array()->items(
                $schema->object(
                    properties: [
                        'title' => $schema->string()->required(),
                        'description' => $schema->string()->nullable(),
                        'type' => $schema->string()->required(),
                        'start_at' => $schema->string()->required(),
                        'end_at' => $schema->string()->required(),
                        'task_id' => $schema->integer()->nullable(),
                        'deadline_id' => $schema->integer()->nullable(),
                        'subject_id' => $schema->integer()->nullable(),
                        'estimated_minutes' => $schema->integer()->nullable(),
                        'reason' => $schema->string()->required(),
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

    public function generate(
        PlannerDaySuggestionContextData $context,
        AiProvider $provider,
        string $model,
        ?GeneratePlannerDaySuggestionsData $input = null,
        ?AiContextSession $session = null,
    ): AgentResponse {
        $this->context = $context;

        return $this->prompt(
            $this->buildPrompt($context, $input),
            provider: $this->toLab($provider),
            model: $model,
        );
    }

    private function buildPrompt(
        PlannerDaySuggestionContextData $context,
        ?GeneratePlannerDaySuggestionsData $input = null,
    ): string {
        $tasks = array_slice($context->candidateTasks, 0, 4);
        $deadlines = array_slice($context->candidateDeadlines, 0, 4);
        $lessons = array_map(fn (array $lesson): array => [
            'title' => $lesson['title'] ?? null,
            'start_at' => $lesson['start_at'] ?? null,
            'end_at' => $lesson['end_at'] ?? null,
        ], $context->lessons);
        $blocks = array_map(fn (array $block): array => [
            'type' => $block['type'] ?? null,
            'start_at' => $block['start_at'] ?? null,
            'end_at' => $block['end_at'] ?? null,
            'is_locked' => $block['is_locked'] ?? false,
        ], $context->plannerBlocks);

        return implode(PHP_EOL, [
            'Сформуй чернетку плану дня.',
            'Дата: ' . $context->date->toDateString(),
            'Максимум блоків: ' . (string) ($input?->maxBlocks ?? 6),
            'Вільні слоти: ' . json_encode($context->freeSlots, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Уроки: ' . json_encode($lessons, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Існуючі блоки: ' . json_encode($blocks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Кандидати задач: ' . json_encode($tasks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Кандидати дедлайнів: ' . json_encode($deadlines, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Короткий summary дня: ' . json_encode([
                'planned_minutes' => $context->daySummary['planned_minutes'] ?? null,
                'free_minutes' => $context->daySummary['free_minutes'] ?? null,
                'conflicts_count' => $context->daySummary['conflicts_count'] ?? null,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Поверни тільки дані за схемою.',
        ]);
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
