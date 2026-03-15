<?php

declare(strict_types=1);

namespace App\Modules\Ai\Events;

use App\Modules\Ai\Models\AiRun;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Throwable;

final class AiRunFailed
{
    use Dispatchable;
    use SerializesModels;

    /**
     * @param array<string, mixed> $meta
     */
    public function __construct(
        public AiRun $run,
        public Throwable|string|null $error = null,
        public array $meta = [],
        public ?int $latencyMs = null,
    ) {
    }
}
