<?php

declare(strict_types=1);

namespace App\Modules\Ai\UseCases;

use App\Models\Files\File;
use App\Modules\Ai\Agents\FileSummaryAgent;
use App\Modules\Ai\Contracts\AiUseCaseContract;
use App\Modules\Ai\Context\Builders\FileSummaryContextBuilder;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Enums\AiRunStatus;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSessionStatus;
use App\Modules\Ai\Events\AiArtifactCreated;
use App\Modules\Ai\Events\AiRunCompleted;
use App\Modules\Ai\Events\AiRunFailed;
use App\Modules\Ai\Events\AiRunRequested;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Exceptions\AiProviderException;
use App\Modules\Ai\Exceptions\UnsupportedAiAttachmentException;
use App\Modules\Ai\Formatters\SummaryArtifactFormatter;
use App\Modules\Ai\Models\AiArtifact;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Models\AiRun;
use App\Modules\Ai\Support\AiAttachmentFactory;
use App\Modules\Ai\Support\AiModelResolver;
use App\Modules\Ai\Support\AiResponseExtractor;
use App\Modules\Ai\Support\AiRunRecorder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class SummarizeFile implements AiUseCaseContract
{
    public function __construct(
        private FileSummaryContextBuilder $contextBuilder,
        private FileSummaryAgent $agent,
        private SummaryArtifactFormatter $formatter,
        private AiModelResolver $modelResolver,
        private AiAttachmentFactory $attachmentFactory,
        private AiRunRecorder $runRecorder,
        private AiResponseExtractor $responseExtractor,
    ) {
    }

    /**
     * @return array{run: AiRun|null, artifact: AiArtifact}
     *
     * @throws AiContextException
     * @throws AiProviderException
     * @throws UnsupportedAiAttachmentException
     * @throws Throwable
     */
    public function handle(object $data): array
    {
        if (!$data instanceof SummarizeFileData) {
            throw AiContextException::invalidDto(
                SummarizeFileData::class,
                get_debug_type($data),
            );
        }

        $context = $this->contextBuilder->buildFromData($data);
        $session = $this->resolveSession($data, $context->fileName, $context->fileId);

        if (!$data->forceRefresh) {
            $existingArtifact = $this->resolveLatestArtifact($data->userId, $context->fileId);

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

        /** @var array{provider: AiProvider, model: string} $resolvedModel */
        $resolvedModel = $this->modelResolver->resolve(
            useCase: 'summarize_file',
            requestedModel: $data->model,
        );

        $attachmentPayload = $this->attachmentFactory->buildPayload($context);

        $run = $this->runRecorder->createPendingRun(
            userId: $data->userId,
            sessionId: (int) $session->getKey(),
            useCase: 'summarize_file',
            agent: FileSummaryAgent::class,
            provider: $resolvedModel['provider'],
            model: $resolvedModel['model'],
            resultType: AiArtifactType::SUMMARY,
            inputSnapshot: $data->toArray(),
            contextSnapshot: $context->toArray(),
            meta: [
                'file_id' => $context->fileId,
                'file_name' => $context->fileName,
                'session_id' => $session->getKey(),
            ],
        );

        $startedAt = microtime(true);

        event(new AiRunRequested(
            run: $run,
            meta: [
                'session_id' => $session->getKey(),
            ],
        ));

        try {
            $response = $this->agent->summarize(
                context: $context,
                attachment: $attachmentPayload,
                provider: $resolvedModel['provider'],
                model: $resolvedModel['model'],
                input: $data,
                session: $session,
            );

            $artifactData = $this->formatter->formatSummary(
                response: $response,
                context: $context,
                input: $data,
            );

            $artifact = DB::transaction(function () use ($data, $run, $context, $artifactData): AiArtifact {
                return AiArtifact::query()->create([
                    'user_id' => $data->userId,
                    'run_id' => $run->getKey(),
                    'type' => $artifactData->type(),
                    'title' => $artifactData->title,
                    'content_json' => $artifactData->toContentJson(),
                    'content_text' => $artifactData->toContentText(),
                    'source_context_type' => $this->fileMorphType(),
                    'source_context_id' => $context->fileId,
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
                        'file_id' => $context->fileId,
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
                    'file_id' => $context->fileId,
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
    private function resolveSession(
        SummarizeFileData $data,
        string $fileName,
        int $fileId,
    ): AiContextSession {
        if ($data->sessionId !== null) {
            $session = AiContextSession::query()
                ->whereKey($data->sessionId)
                ->where('user_id', $data->userId)
                ->first();

            if (!$session instanceof AiContextSession) {
                throw AiContextException::fromMessage(
                    'AI-сесію не знайдено або доступ до неї заборонено.',
                    [
                        'session_id' => $data->sessionId,
                        'user_id' => $data->userId,
                    ],
                );
            }

            if (!$session->canAcceptNewRuns()) {
                throw AiContextException::fromMessage(
                    'AI-сесія не приймає нові запуски.',
                    [
                        'session_id' => $session->getKey(),
                        'status' => $this->sessionStatusValue($session),
                    ],
                );
            }

            return $session;
        }

        $session = AiContextSession::query()
            ->where('user_id', $data->userId)
            ->where('context_type', $this->fileMorphType())
            ->where('context_id', $fileId)
            ->where('mode', AiSessionMode::SUMMARY->value)
            ->first();

        if ($session instanceof AiContextSession) {
            if (!$session->canAcceptNewRuns()) {
                throw AiContextException::fromMessage(
                    'Для цього файла існує AI-сесія, але вона неактивна.',
                    [
                        'session_id' => $session->getKey(),
                        'status' => $this->sessionStatusValue($session),
                    ],
                );
            }

            return $session;
        }

        return AiContextSession::query()->create([
            'user_id' => $data->userId,
            'context_type' => $this->fileMorphType(),
            'context_id' => $fileId,
            'title' => 'Файл: ' . $fileName,
            'mode' => AiSessionMode::SUMMARY,
            'status' => AiSessionStatus::ACTIVE,
            'last_used_at' => now(),
        ]);
    }

    private function resolveLatestArtifact(int $userId, int $fileId): ?AiArtifact
    {
        return AiArtifact::query()
            ->with('run')
            ->where('user_id', $userId)
            ->where('type', AiArtifactType::SUMMARY->value)
            ->where('source_context_type', $this->fileMorphType())
            ->where('source_context_id', $fileId)
            ->whereHas('run', function (Builder $query): void {
                $query->where('status', AiRunStatus::COMPLETED->value);
            })
            ->latest('id')
            ->first();
    }

    private function sessionStatusValue(AiContextSession $session): ?string
    {
        $status = $session->getAttribute('status');

        if ($status instanceof AiSessionStatus) {
            return $status->value;
        }

        return is_string($status) ? $status : null;
    }

    private function fileMorphType(): string
    {
        return new File()->getMorphClass();
    }
}
