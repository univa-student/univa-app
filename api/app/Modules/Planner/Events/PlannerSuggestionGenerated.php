<?php

namespace App\Modules\Planner\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlannerSuggestionGenerated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly int $userId,
        public readonly array $suggestion,
    ) {}
}
