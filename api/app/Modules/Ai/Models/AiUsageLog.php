<?php

declare(strict_types=1);

namespace App\Modules\Ai\Models;

use App\Models\User;
use App\Modules\Ai\Enums\AiProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiUsageLog extends Model
{
    protected $table = 'ai_usage_logs';

    protected $fillable = [
        'run_id',
        'user_id',
        'provider',
        'model',
        'input_tokens',
        'output_tokens',
        'total_tokens',
        'latency_ms',
        'estimated_cost_usd',
        'raw_usage',
    ];

    protected $casts = [
        'provider' => AiProvider::class,
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'total_tokens' => 'integer',
        'latency_ms' => 'integer',
        'estimated_cost_usd' => 'decimal:8',
        'raw_usage' => 'array',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(AiRun::class, 'run_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
