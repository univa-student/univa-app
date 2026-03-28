<?php

declare(strict_types=1);

namespace App\Modules\Ai\UseCases;

use App\Modules\Ai\Agents\DailyDigestAgent;
use App\Modules\Ai\Contracts\AiUseCaseContract;
use App\Modules\Ai\Context\Builders\DailyDigestContextBuilder;
use App\Modules\Ai\DTO\GenerateDailyDigestData;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Enums\AiRunStatus;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSessionStatus;
use App\Modules\Ai\Events\AiArtifactCreated;
use App\Modules\Ai\Events\AiRunCompleted;
use App\Modules\Ai\Events\AiRunFailed;
use App\Modules\Ai\Events\AiRunRequested;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Exceptions\AiProviderException;
use App\Modules\Ai\Formatters\DailyDigestArtifactFormatter;
use App\Modules\Ai\Models\AiArtifact;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Models\AiRun;
use App\Modules\Ai\Support\AiModelResolver;
use App\Modules\Ai\Support\AiResponseExtractor;
use App\Modules\Ai\Support\AiRunRecorder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class GenerateDailyDigest implements AiUseCaseContract
{
    public function __construct(
        private DailyDigestContextBuilder $contextBuilder,
        private DailyDigestAgent $agent,
        private DailyDigestArtifactFormatter $formatter,
        private AiModelResolver $modelResolver,
        private AiRunRecorder $runRecorder,
        private AiResponseExtractor $responseExtractor,
    ) {
    }

    /**
     * @return array{run: AiRun|null, artifact: AiArtifact}
     *
     * @throws AiContextException
     * @throws AiProviderException
     * @throws Throwable
     */
    public function handle(object $data): array
    {
        if (!$data instanceof GenerateDailyDigestData) {
            throw AiContextException::invalidDto(
                GenerateDailyDigestData::class,
                get_debug_type($data),
            );
        }

        $context = $this->contextBuilder->buildFromData($data);
        $session = $this->resolveSession($data);

        if (!$data->forceRefresh) {
            $existingArtifact = $this->resolveLatestArtifactForDate($data->userId, $data->date->toDateString());

            if ($existingArtifact instanceof AiArtifact) {
                $session->touchLastUsedAt();

                $existingRun = $existingArtifact->relationLoaded('run')
                    ? $existingArtifact->getRelation('run')
                    : null;

                return [
                    'run' => $existingRun instanceof AiRun ? $existingRun : null,
                    'artifact' => $existingArtifact,
                ];
            }
        }

        $resolvedModel = $this->modelResolver->resolve(
            useCase: 'generate_daily_digest',
            requestedModel: $data->model,
        );

        $run = $this->runRecorder->createPendingRun(
            userId: $data->userId,
            sessionId: (int) $session->getKey(),
            useCase: 'generate_daily_digest',
            agent: DailyDigestAgent::class,
            provider: $resolvedModel['provider'],
            model: $resolvedModel['model'],
            resultType: AiArtifactType::DAILY_DIGEST,
            inputSnapshot: $data->toArray(),
            contextSnapshot: $context->toArray(),
            meta: [
                'session_id' => $session->getKey(),
                'digest_date' => $data->date->toDateString(),
            ],
        );

        $startedAt = microtime(true);

        event(new AiRunRequested(
            run: $run,
            meta: [
                'session_id' => $session->getKey(),
                'digest_date' => $data->date->toDateString(),
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

            $artifactData = $this->formatter->formatDigest(
                response: $response,
                context: $context,
                input: $data,
            );

            $artifact = DB::transaction(function () use ($data, $run, $artifactData): AiArtifact {
                return AiArtifact::query()->create([
                    'user_id' => $data->userId,
                    'run_id' => $run->getKey(),
                    'type' => $artifactData->type(),
                    'title' => $artifactData->title,
                    'content_json' => $artifactData->toContentJson(),
                    'content_text' => $artifactData->toContentText(),
                    'source_context_type' => null,
                    'source_context_id' => null,
                ]);
            });

            $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

            $usage = array_filter(
                $this->responseExtractor->extractUsage($response),
                static fn (mixed $value): bool => $value !== null && $value !== [],
            );

            $meta = array_filter(
                array_merge(
                    $this->responseExtractor->extractMeta($response),
                    [
                        'artifact_id' => $artifact->getKey(),
                        'digest_date' => $data->date->toDateString(),
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

            event(new AiArtifactCreated(
                artifact: $artifact,
            ));

            $session->touchLastUsedAt();

            $freshRun = $run->fresh();
            $freshArtifact = $artifact->fresh();

            return [
                'run' => $freshRun instanceof AiRun ? $freshRun : $run,
                'artifact' => $freshArtifact instanceof AiArtifact ? $freshArtifact : $artifact,
            ];
        } catch (Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

            event(new AiRunFailed(
                run: $run,
                error: $e,
                meta: [
                    'digest_date' => $data->date->toDateString(),
                    'session_id' => $session->getKey(),
                ],
                latencyMs: $latencyMs,
            ));

            throw $e;
        }
    }

    private function resolveSession(GenerateDailyDigestData $data): AiContextSession
    {
        $session = AiContextSession::query()
            ->where('user_id', $data->userId)
            ->whereNull('context_type')
            ->whereNull('context_id')
            ->where('mode', AiSessionMode::DAILY_DIGEST->value)
            ->first();

        if ($session instanceof AiContextSession) {
            if (!$session->canAcceptNewRuns()) {
                throw AiContextException::fromMessage(
                    'AI-сесія дайджесту існує, але неактивна.',
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
            'title' => 'AI-дайджест дня',
            'mode' => AiSessionMode::DAILY_DIGEST,
            'status' => AiSessionStatus::ACTIVE,
            'last_used_at' => now(),
        ]);
    }

    private function resolveLatestArtifactForDate(int $userId, string $date): ?AiArtifact
    {
        return AiArtifact::query()
            ->with('run')
            ->where('user_id', $userId)
            ->where('type', AiArtifactType::DAILY_DIGEST->value)
            ->where(function (Builder $query) use ($date): void {
                $query
                    ->where('content_json->meta->generated_for_date', $date)
                    ->orWhereDate('created_at', $date);
            })
            ->whereHas('run', function (Builder $query): void {
                $query->where('status', AiRunStatus::COMPLETED->value);
            })
            ->latest('id')
            ->first();
    }
}
