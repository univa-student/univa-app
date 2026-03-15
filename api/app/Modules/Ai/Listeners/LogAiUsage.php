<?php

declare(strict_types=1);

namespace App\Modules\Ai\Listeners;

use App\Modules\Ai\Events\AiRunCompleted;
use App\Modules\Ai\Support\AiRunRecorder;

final readonly class LogAiUsage
{
    public function __construct(
        private AiRunRecorder $runRecorder,
    ) {
    }

    public function handle(AiRunCompleted $event): void
    {
        $usage = $event->usage;

        if ($event->latencyMs !== null && !array_key_exists('latency_ms', $usage)) {
            $usage['latency_ms'] = $event->latencyMs;
        }

        $this->runRecorder->storeUsage(
            run: $event->run,
            usage: $usage,
        );
    }
}
