<?php

namespace App\Modules\Planner\Events;

use App\Modules\Planner\Models\PlannerBlock;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlannerBlockDeleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly PlannerBlock $block,
    ) {}
}
