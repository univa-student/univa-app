<?php

declare(strict_types=1);

namespace App\Modules\Ai\Models;

use App\Models\User;
use App\Modules\Ai\Enums\AiArtifactType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AiArtifact extends Model
{
    protected $table = 'ai_artifacts';

    protected $fillable = [
        'user_id',
        'run_id',
        'type',
        'title',
        'content_json',
        'content_text',
        'source_context_type',
        'source_context_id',
    ];

    protected $casts = [
        'type' => AiArtifactType::class,
        'content_json' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(AiRun::class, 'run_id');
    }

    public function sourceContext(): MorphTo
    {
        return $this->morphTo();
    }

    public function getSummaryText(): ?string
    {
        if (!empty($this->content_text)) {
            return $this->content_text;
        }

        if (is_array($this->content_json) && isset($this->content_json['overview'])) {
            return (string) $this->content_json['overview'];
        }

        if (is_array($this->content_json) && isset($this->content_json['short_summary'])) {
            return (string) $this->content_json['short_summary'];
        }

        return null;
    }
}
