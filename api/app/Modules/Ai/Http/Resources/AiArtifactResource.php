<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Resources;

use App\Modules\Ai\Models\AiArtifact;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AiArtifact */
class AiArtifactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->getKey(),
            'user_id' => (int) $this->getAttribute('user_id'),
            'run_id' => (int) $this->getAttribute('run_id'),

            'type' => $this->getAttribute('type')?->value
                ?? (string) $this->getAttribute('type'),

            'title' => $this->getAttribute('title'),

            'content_json' => $this->getAttribute('content_json'),
            'content_text' => $this->getAttribute('content_text'),

            'source_context_type' => $this->getAttribute('source_context_type'),
            'source_context_id' => $this->getAttribute('source_context_id') !== null
                ? (int) $this->getAttribute('source_context_id')
                : null,

            'summary_text' => method_exists($this->resource, 'getSummaryText')
                ? $this->resource->getSummaryText()
                : null,

            'created_at' => $this->getAttribute('created_at')?->toISOString(),
            'updated_at' => $this->getAttribute('updated_at')?->toISOString(),
        ];
    }
}
