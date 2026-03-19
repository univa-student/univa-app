<?php

declare(strict_types=1);

namespace App\Modules\Ai\Models;

use App\Models\User;
use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Enums\AiRunStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AiRun extends Model
{
    protected $table = 'ai_runs';

    protected $fillable = [
        'user_id',
        'session_id',
        'use_case',
        'agent',
        'provider',
        'model',
        'status',
        'input_snapshot',
        'context_snapshot',
        'result_type',
        'started_at',
        'finished_at',
        'latency_ms',
        'error_message',
        'meta',
    ];

    protected $casts = [
        'provider' => AiProvider::class,
        'status' => AiRunStatus::class,
        'result_type' => AiArtifactType::class,
        'input_snapshot' => 'array',
        'context_snapshot' => 'array',
        'meta' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'latency_ms' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiContextSession::class, 'session_id');
    }

    public function artifacts(): HasMany
    {
        return $this->hasMany(AiArtifact::class, 'run_id');
    }

    public function latestArtifact(): HasOne
    {
        return $this->hasOne(AiArtifact::class, 'run_id')->latestOfMany();
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(AiUsageLog::class, 'run_id');
    }

    public function scopeFinished(Builder $query): Builder
    {
        return $query->whereIn('status', [
            AiRunStatus::COMPLETED->value,
            AiRunStatus::FAILED->value,
            AiRunStatus::CANCELED->value,
        ]);
    }

    public function scopeSuccessful(Builder $query): Builder
    {
        return $query->where('status', AiRunStatus::COMPLETED->value);
    }

    public function markAsProcessing(): void
    {
        $this->forceFill([
            'status' => AiRunStatus::PROCESSING,
            'started_at' => $this->started_at ?? now(),
        ])->save();
    }

    public function markAsCompleted(?int $latencyMs = null): void
    {
        $this->forceFill([
            'status' => AiRunStatus::COMPLETED,
            'finished_at' => now(),
            'latency_ms' => $latencyMs ?? $this->latency_ms,
        ])->save();
    }

    public function markAsFailed(?string $errorMessage = null, ?int $latencyMs = null): void
    {
        $this->forceFill([
            'status' => AiRunStatus::FAILED,
            'finished_at' => now(),
            'latency_ms' => $latencyMs ?? $this->latency_ms,
            'error_message' => $errorMessage,
        ])->save();
    }

    public function isFinished(): bool
    {
        return $this->status?->isFinished() ?? false;
    }

    public function isSuccessful(): bool
    {
        return $this->status?->isSuccessful() ?? false;
    }
}
