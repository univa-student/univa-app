<?php

declare(strict_types=1);

namespace App\Modules\Ai\Listeners;

use App\Modules\Ai\Events\AiRunCompleted;
use App\Modules\Ai\Events\AiRunFailed;
use App\Modules\Ai\Events\AiRunRequested;
use App\Modules\Ai\Support\AiRunRecorder;

final readonly class UpdateAiRunStatus
{
    public function __construct(
        private AiRunRecorder $runRecorder,
    ) {
    }

    public function handle(object $event): void
    {
        if ($event instanceof AiRunRequested) {
            $this->runRecorder->markProcessing(
                run: $event->run,
                meta: $event->meta,
            );

            return;
        }

        if ($event instanceof AiRunCompleted) {
            $this->runRecorder->markCompleted(
                run: $event->run,
                latencyMs: $event->latencyMs,
                meta: $event->meta,
            );

            return;
        }

        if ($event instanceof AiRunFailed) {
            $this->runRecorder->markFailed(
                run: $event->run,
                error: $event->error,
                latencyMs: $event->latencyMs,
                meta: $event->meta,
            );
        }
    }
}
