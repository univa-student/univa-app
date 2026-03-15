<?php

declare(strict_types=1);

namespace App\Modules\Ai\Support;

use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Enums\AiRunStatus;
use App\Modules\Ai\Models\AiRun;
use App\Modules\Ai\Models\AiUsageLog;
use Throwable;

final readonly class AiRunRecorder
{
    public function createPendingRun(
        int $userId,
        ?int $sessionId,
        string $useCase,
        string $agent,
        AiProvider $provider,
        ?string $model = null,
        ?AiArtifactType $resultType = null,
        array $inputSnapshot = [],
        array $contextSnapshot = [],
        array $meta = [],
    ): AiRun {
        return AiRun::query()->create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'use_case' => $useCase,
            'agent' => $agent,
            'provider' => $provider,
            'model' => $model,
            'status' => AiRunStatus::PENDING,
            'input_snapshot' => $inputSnapshot,
            'context_snapshot' => $contextSnapshot,
            'result_type' => $resultType,
            'meta' => $meta,
        ]);
    }

    public function markProcessing(AiRun $run, array $meta = []): AiRun
    {
        $this->mergeMeta($run, $meta);
        $run->markAsProcessing();

        return $run->refresh();
    }

    public function markCompleted(AiRun $run, ?int $latencyMs = null, array $meta = []): AiRun
    {
        $this->mergeMeta($run, $meta);
        $run->markAsCompleted($latencyMs);

        return $run->refresh();
    }

    public function markFailed(
        AiRun $run,
        Throwable|string|null $error = null,
        ?int $latencyMs = null,
        array $meta = [],
    ): AiRun {
        $message = match (true) {
            $error instanceof Throwable => $error->getMessage(),
            is_string($error) => $error,
            default => null,
        };

        if ($error instanceof Throwable) {
            $meta = array_merge($meta, [
                'exception_class' => $error::class,
            ]);
        }

        $this->mergeMeta($run, $meta);
        $run->markAsFailed($message, $latencyMs);

        return $run->refresh();
    }

    /**
     * @param array{
     *     provider?: string,
     *     model?: string|null,
     *     input_tokens?: int,
     *     output_tokens?: int,
     *     total_tokens?: int,
     *     latency_ms?: int|null,
     *     estimated_cost_usd?: float|string|null,
     *     raw_usage?: array<string, mixed>|null
     * } $usage
     */
    public function storeUsage(AiRun $run, array $usage): ?AiUsageLog
    {
        $hasAnyUsage =
            array_key_exists('input_tokens', $usage) ||
            array_key_exists('output_tokens', $usage) ||
            array_key_exists('total_tokens', $usage) ||
            array_key_exists('raw_usage', $usage);

        if (!$hasAnyUsage) {
            return null;
        }

        $provider = $usage['provider'] ?? $run->provider?->value;
        $model = $usage['model'] ?? $run->model;

        return AiUsageLog::query()->create([
            'run_id' => $run->getKey(),
            'user_id' => $run->user_id,
            'provider' => $provider,
            'model' => $model,
            'input_tokens' => (int) ($usage['input_tokens'] ?? 0),
            'output_tokens' => (int) ($usage['output_tokens'] ?? 0),
            'total_tokens' => (int) ($usage['total_tokens'] ?? 0),
            'latency_ms' => isset($usage['latency_ms']) ? (int) $usage['latency_ms'] : null,
            'estimated_cost_usd' => $usage['estimated_cost_usd'] ?? null,
            'raw_usage' => $usage['raw_usage'] ?? null,
        ]);
    }

    private function mergeMeta(AiRun $run, array $meta): void
    {
        if ($meta === []) {
            return;
        }

        $existingMeta = is_array($run->meta) ? $run->meta : [];

        $run->forceFill([
            'meta' => array_merge($existingMeta, $meta),
        ])->save();
    }
}
