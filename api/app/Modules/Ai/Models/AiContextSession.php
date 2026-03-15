<?php

declare(strict_types=1);

namespace App\Modules\Ai\Models;

use App\Models\User;
use App\Modules\Ai\Enums\AiContextType;
use App\Modules\Ai\Enums\AiSessionMode;
use App\Modules\Ai\Enums\AiSessionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AiContextSession extends Model
{
    protected $table = 'ai_context_sessions';

    protected $fillable = [
        'user_id',
        'context_type',
        'context_id',
        'title',
        'mode',
        'status',
        'agent_conversation_id',
        'last_used_at',
    ];

    protected $casts = [
        'mode' => AiSessionMode::class,
        'status' => AiSessionStatus::class,
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function context(): MorphTo
    {
        return $this->morphTo();
    }

    public function runs(): HasMany
    {
        return $this->hasMany(AiRun::class, 'session_id');
    }

    public function isActive(): bool
    {
        return $this->status?->isActive() ?? false;
    }

    public function canAcceptNewRuns(): bool
    {
        return $this->status?->canAcceptNewRuns() ?? false;
    }

    public function touchLastUsedAt(): void
    {
        $this->forceFill([
            'last_used_at' => now(),
        ])->save();
    }
}
