<?php

declare(strict_types=1);

namespace App\Modules\Ai\UseCases;

use App\Modules\Ai\Agents\FileSummaryAgent;
use App\Modules\Ai\Context\Builders\FileSummaryContextBuilder;
use App\Modules\Ai\Contracts\AiUseCaseContract;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\DTO\SummaryContextData;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Enums\AiRunStatus;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSessionStatus;
use App\Modules\Ai\Enums\AiSummaryStyle;
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
use App\Modules\Files\Models\File;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class SummarizeFile implements AiUseCaseContract
{
    private const DIRECT_MULTI_FILE_LIMIT = 2;

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
        $session = $this->resolveSession($data, $context->displayName());

        if ($this->canReuseArtifact($data)) {
            $existingArtifact = $this->resolveLatestArtifact($data->userId, $data->primaryFileId());

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
            userId: $data->userId,
        );

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
                'file_id' => $data->primaryFileId(),
                'file_ids' => $context->fileIds(),
                'file_name' => $context->displayName(),
                'session_id' => $session->getKey(),
                'style' => $data->style->value,
                'include_flashcards' => $data->includeFlashcards,
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
            ['response' => $response, 'format_context' => $formatContext] = $this->generateSummaryResponse(
                context: $context,
                data: $data,
                provider: $resolvedModel['provider'],
                model: $resolvedModel['model'],
                session: $session,
            );

            $artifactData = $this->formatter->formatSummary(
                response: $response,
                context: $formatContext,
                input: $data,
            );

            $artifact = DB::transaction(function () use ($data, $run, $context, $artifactData): AiArtifact {
                $sourceContextType = null;
                $sourceContextId = null;

                if (!$context->isMultiFile()) {
                    $sourceContextType = $this->fileMorphType();
                    $sourceContextId = $data->primaryFileId();
                }

                return AiArtifact::query()->create([
                    'user_id' => $data->userId,
                    'run_id' => $run->getKey(),
                    'type' => $artifactData->type(),
                    'title' => $artifactData->title,
                    'content_json' => $artifactData->toContentJson(),
                    'content_text' => $artifactData->toContentText(),
                    'source_context_type' => $sourceContextType,
                    'source_context_id' => $sourceContextId,
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
                        'file_id' => $data->primaryFileId(),
                        'file_ids' => $context->fileIds(),
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
                    'file_id' => $data->primaryFileId(),
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
        string $title,
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

        if ($this->canReuseArtifact($data)) {
            $session = AiContextSession::query()
                ->where('user_id', $data->userId)
                ->where('context_type', $this->fileMorphType())
                ->where('context_id', $data->primaryFileId())
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
        }

        return AiContextSession::query()->create([
            'user_id' => $data->userId,
            'context_type' => $this->canReuseArtifact($data) ? $this->fileMorphType() : null,
            'context_id' => $this->canReuseArtifact($data) ? $data->primaryFileId() : null,
            'title' => 'Матеріал: ' . $title,
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

    private function canReuseArtifact(SummarizeFileData $data): bool
    {
        return !$data->forceRefresh
            && !$data->isMultiFile()
            && !$data->includeFlashcards
            && $data->style === AiSummaryStyle::STANDARD;
    }

    /**
     * @return array{response: mixed, format_context: SummaryContextData}
     *
     * @throws AiProviderException
     * @throws UnsupportedAiAttachmentException
     * @throws Throwable
     */
    private function generateSummaryResponse(
        SummaryContextData $context,
        SummarizeFileData $data,
        AiProvider $provider,
        string $model,
        ?AiContextSession $session = null,
    ): array {
        if (!$this->shouldUseHierarchicalMerge($context)) {
            return [
                'response' => $this->callSummaryAgent(
                    context: $context,
                    data: $data,
                    provider: $provider,
                    model: $model,
                    session: $session,
                ),
                'format_context' => $context,
            ];
        }

        $chunkSummaries = [];

        foreach (array_chunk($context->files, self::DIRECT_MULTI_FILE_LIMIT) as $index => $chunkFiles) {
            $chunkContext = new SummaryContextData(
                files: $chunkFiles,
                subjectId: $context->subjectId,
                subjectName: $context->subjectName,
                language: $context->language,
                extra: array_merge($context->extra, [
                    'chunk_index' => $index + 1,
                    'chunk_total' => (int) ceil(count($context->files) / self::DIRECT_MULTI_FILE_LIMIT),
                ]),
            );

            $chunkInput = $this->makeIntermediateInput($data, $chunkContext->fileIds());
            $chunkResponse = $this->callSummaryAgent(
                context: $chunkContext,
                data: $chunkInput,
                provider: $provider,
                model: $model,
                session: null,
            );

            $chunkArtifact = $this->formatter->formatSummary(
                response: $chunkResponse,
                context: $chunkContext,
                input: $chunkInput,
            );

            $chunkSummaries[] = [
                'files' => $chunkContext->fileNames(),
                'title' => $chunkArtifact->title,
                'short_summary' => $chunkArtifact->shortSummary,
                'main_points' => array_slice($chunkArtifact->mainPoints, 0, 4),
                'key_terms' => array_slice($chunkArtifact->keyTerms, 0, 4),
            ];
        }

        $mergeContext = new SummaryContextData(
            files: $context->files,
            subjectId: $context->subjectId,
            subjectName: $context->subjectName,
            language: $context->language,
            extra: array_merge($context->extra, [
                'source_summaries' => $chunkSummaries,
                'merge_strategy' => 'hierarchical',
            ]),
        );

        return [
            'response' => $this->callSummaryAgent(
                context: $mergeContext,
                data: $data,
                provider: $provider,
                model: $model,
                session: $session,
            ),
            'format_context' => $mergeContext,
        ];
    }

    /**
     * @throws AiProviderException
     * @throws UnsupportedAiAttachmentException
     * @throws Throwable
     */
    private function callSummaryAgent(
        SummaryContextData $context,
        SummarizeFileData $data,
        AiProvider $provider,
        string $model,
        ?AiContextSession $session = null,
    ): mixed {
        $attachments = $this->shouldAttachSourceFiles($context)
            ? $this->attachmentFactory->buildPayloads($context)
            : [];

        return $this->agent->summarize(
            context: $context,
            attachments: $attachments,
            provider: $provider,
            model: $model,
            input: $data,
            session: $session,
        );
    }

    private function shouldUseHierarchicalMerge(SummaryContextData $context): bool
    {
        return count($context->files) > self::DIRECT_MULTI_FILE_LIMIT;
    }

    private function shouldAttachSourceFiles(SummaryContextData $context): bool
    {
        return !is_array($context->extra['source_summaries'] ?? null)
            || $context->extra['source_summaries'] === [];
    }

    private function makeIntermediateInput(SummarizeFileData $data, array $fileIds): SummarizeFileData
    {
        return new SummarizeFileData(
            userId: $data->userId,
            fileIds: $fileIds,
            mode: $data->mode,
            sessionId: null,
            language: $data->language,
            notes: $data->notes,
            forceRefresh: $data->forceRefresh,
            model: $data->model,
            style: $data->style,
            includeFlashcards: false,
        );
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
