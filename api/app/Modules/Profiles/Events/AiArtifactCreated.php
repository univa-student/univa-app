<?php

declare(strict_types=1);

namespace App\Modules\Ai\Events;

use App\Modules\Ai\Models\AiArtifact;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class AiArtifactCreated
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public AiArtifact $artifact,
    ) {
    }
}
