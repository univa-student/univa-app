<?php

declare(strict_types=1);

namespace App\Modules\Ai\UseCases;

use App\Modules\Ai\Agents\PlannerDaySuggestionAgent;
use App\Modules\Ai\Context\Builders\PlannerDaySuggestionContextBuilder;
use App\Modules\Ai\Contracts\AiUseCaseContract;
use App\Modules\Ai\DTO\GeneratePlannerDaySuggestionsData;
use App\Modules\Ai\Enums\AiRunStatus;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSessionStatus;
use App\Modules\Ai\Events\AiRunCompleted;
use App\Modules\Ai\Events\AiRunFailed;
use App\Modules\Ai\Events\AiRunRequested;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Exceptions\AiProviderException;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Models\AiRun;
use App\Modules\Ai\Support\AiModelResolver;
use App\Modules\Ai\Support\AiResponseExtractor;
use App\Modules\Ai\Support\AiRunRecorder;
use Throwable;

readonly class GeneratePlannerDaySuggestions implements AiUseCaseContract
{
    public function __construct(
        private PlannerDaySuggestionContextBuilder $contextBuilder,
        private PlannerDaySuggestionAgent $agent,
        private AiModelResolver $modelResolver,
        private AiRunRecorder $runRecorder,
        private AiResponseExtractor $responseExtractor,
    ) {
    }

    /**
     * @return array{run: AiRun, suggestion: array<string, mixed>}
     *
     * @throws AiContextException
     * @throws AiProviderException
     * @throws Throwable
     */
    public function handle(object $data): array
    {
        if (!$data instanceof GeneratePlannerDaySuggestionsData) {
            throw AiContextException::invalidDto(
                GeneratePlannerDaySuggestionsData::class,
                get_debug_type($data),
            );
        }

        $context = $this->contextBuilder->buildFromData($data);
        $session = $this->resolveSession($data);

        $resolvedModel = $this->modelResolver->resolve(
            useCase: 'generate_planner_day_suggestions',
            requestedModel: $data->model,
            userId: $data->userId,
        );

        $run = $this->runRecorder->createPendingRun(
            userId: $data->userId,
            sessionId: (int) $session->getKey(),
            useCase: 'generate_planner_day_suggestions',
            agent: PlannerDaySuggestionAgent::class,
            provider: $resolvedModel['provider'],
            model: $resolvedModel['model'],
            resultType: null,
            inputSnapshot: $data->toArray(),
            contextSnapshot: $context->toArray(),
            meta: [
                'session_id' => $session->getKey(),
                'planner_date' => $data->date->toDateString(),
            ],
        );

        $startedAt = microtime(true);

        event(new AiRunRequested(
            run: $run,
            meta: [
                'session_id' => $session->getKey(),
                'planner_date' => $data->date->toDateString(),
            ],
        ));

        try {
            $response = $this->agent->generate(
                context: $context,
                provider: $resolvedModel['provider'],
                model: $resolvedModel['model'],
                input: $data,
                session: $session,
            );

            $structured = $this->responseExtractor->extractStructuredByKeys(
                response: $response,
                keys: ['summary', 'blocks'],
                provider: $resolvedModel['provider']->value,
            );

            $suggestion = $this->normalizeSuggestion($structured, $data->date->toDateString(), $data->maxBlocks);

            $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);
            $usage = array_filter(
                $this->responseExtractor->extractUsage($response),
                static fn (mixed $value): bool => $value !== null && $value !== [],
            );
            $meta = array_filter(
                array_merge(
                    $this->responseExtractor->extractMeta($response),
                    [
                        'planner_date' => $data->date->toDateString(),
                        'blocks_count' => count($suggestion['blocks']),
                    ],
                ),
                static fn (mixed $value): bool => $value !== null && $value !== '',
            );

            event(new AiRunCompleted(
                run: $run,
                response: $response,
                usage: $usage,
                meta: $meta,
                latencyMs: $latencyMs,
            ));

            $session->touchLastUsedAt();

            $freshRun = $run->fresh();

            return [
                'run' => $freshRun instanceof AiRun ? $freshRun : $run,
                'suggestion' => $suggestion,
            ];
        } catch (Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

            event(new AiRunFailed(
                run: $run,
                error: $e,
                meta: [
                    'planner_date' => $data->date->toDateString(),
                    'session_id' => $session->getKey(),
                ],
                latencyMs: $latencyMs,
            ));

            throw $e;
        }
    }

    /**
     * @throws AiContextException
     */
    private function resolveSession(GeneratePlannerDaySuggestionsData $data): AiContextSession
    {
        $session = AiContextSession::query()
            ->where('user_id', $data->userId)
            ->whereNull('context_type')
            ->whereNull('context_id')
            ->where('mode', AiSessionMode::PLANNER->value)
            ->first();

        if ($session instanceof AiContextSession) {
            if (!$session->canAcceptNewRuns()) {
                throw AiContextException::fromMessage(
                    'AI-сесія планера існує, але неактивна.',
                    [
                        'session_id' => $session->getKey(),
                    ],
                );
            }

            return $session;
        }

        return AiContextSession::query()->create([
            'user_id' => $data->userId,
            'context_type' => null,
            'context_id' => null,
            'title' => 'AI-планер дня',
            'mode' => AiSessionMode::PLANNER,
            'status' => AiSessionStatus::ACTIVE,
            'last_used_at' => now(),
        ]);
    }

    /**
     * @param array<string, mixed> $structured
     * @return array{date: string, summary: string, blocks: array<int, array<string, mixed>>}
     */
    private function normalizeSuggestion(array $structured, string $date, int $maxBlocks): array
    {
        $summary = isset($structured['summary']) && is_string($structured['summary']) && trim($structured['summary']) !== ''
            ? trim($structured['summary'])
            : 'AI не зміг сформувати пояснення для цього дня.';

        $blocks = collect(is_array($structured['blocks'] ?? null) ? $structured['blocks'] : [])
            ->take($maxBlocks)
            ->map(function (mixed $block) use ($date): array {
                if (!is_array($block)) {
                    return [];
                }

                return [
                    'title' => is_string($block['title'] ?? null) && trim($block['title']) !== ''
                        ? trim($block['title'])
                        : 'Фокус-блок',
                    'description' => is_string($block['description'] ?? null) && trim($block['description']) !== ''
                        ? trim($block['description'])
                        : null,
                    'type' => $this->normalizeType($block['type'] ?? null),
                    'start_at' => $this->normalizeDateTime($block['start_at'] ?? null, $date),
                    'end_at' => $this->normalizeDateTime($block['end_at'] ?? null, $date),
                    'task_id' => is_numeric($block['task_id'] ?? null) ? (int) $block['task_id'] : null,
                    'deadline_id' => is_numeric($block['deadline_id'] ?? null) ? (int) $block['deadline_id'] : null,
                    'subject_id' => is_numeric($block['subject_id'] ?? null) ? (int) $block['subject_id'] : null,
                    'estimated_minutes' => is_numeric($block['estimated_minutes'] ?? null) ? (int) $block['estimated_minutes'] : null,
                    'reason' => is_string($block['reason'] ?? null) && trim($block['reason']) !== ''
                        ? trim($block['reason'])
                        : 'AI запропонував цей блок для кращого розподілу дня.',
                ];
            })
            ->filter(fn (array $block): bool => $block !== [] && $block['start_at'] !== null && $block['end_at'] !== null)
            ->values()
            ->all();

        return [
            'date' => $date,
            'summary' => $summary,
            'blocks' => $blocks,
        ];
    }

    private function normalizeType(mixed $value): string
    {
        $type = is_string($value) ? trim($value) : '';

        return in_array($type, ['focus', 'task', 'deadline', 'manual', 'break'], true)
            ? $type
            : 'focus';
    }

    private function normalizeDateTime(mixed $value, string $date): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $normalized = trim($value);

        if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/', $normalized) === 1) {
            return $normalized;
        }

        if (preg_match('/^\d{2}:\d{2}$/', $normalized) === 1) {
            return "{$date}T{$normalized}:00";
        }

        return null;
    }
}
