<?php

declare(strict_types=1);

namespace App\Modules\Ai\Events;

use App\Modules\Ai\Models\AiRun;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class AiRunCompleted
{
    use Dispatchable;
    use SerializesModels;

    /**
     * @param array<string, mixed> $usage
     * @param array<string, mixed> $meta
     */
    public function __construct(
        public AiRun $run,
        public mixed $response = null,
        public array $usage = [],
        public array $meta = [],
        public ?int $latencyMs = null,
    ) {
    }
}
