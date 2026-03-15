<?php

declare(strict_types=1);

namespace App\Modules\Ai\Http\Resources;

use App\Modules\Ai\Models\AiRun;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AiRun */
class AiRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->getKey(),
            'user_id' => (int) $this->getAttribute('user_id'),
            'session_id' => $this->getAttribute('session_id') !== null
                ? (int) $this->getAttribute('session_id')
                : null,

            'use_case' => (string) $this->getAttribute('use_case'),
            'agent' => (string) $this->getAttribute('agent'),

            'provider' => $this->getAttribute('provider')?->value
                ?? (string) $this->getAttribute('provider'),

            'model' => $this->getAttribute('model'),

            'status' => $this->getAttribute('status')?->value
                ?? (string) $this->getAttribute('status'),

            'result_type' => $this->getAttribute('result_type')?->value
                ?? ($this->getAttribute('result_type') !== null
                    ? (string) $this->getAttribute('result_type')
                    : null),

            'input_snapshot' => $this->getAttribute('input_snapshot'),
            'context_snapshot' => $this->getAttribute('context_snapshot'),

            'started_at' => $this->getAttribute('started_at')?->toISOString(),
            'finished_at' => $this->getAttribute('finished_at')?->toISOString(),

            'latency_ms' => $this->getAttribute('latency_ms') !== null
                ? (int) $this->getAttribute('latency_ms')
                : null,

            'error_message' => $this->getAttribute('error_message'),
            'meta' => $this->getAttribute('meta'),

            'created_at' => $this->getAttribute('created_at')?->toISOString(),
            'updated_at' => $this->getAttribute('updated_at')?->toISOString(),
        ];
    }
}
