<?php

namespace App\Modules\Planner\Enums;

enum PlannerBlockStatus: string
{
    case PLANNED = 'planned';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case SKIPPED = 'skipped';
    case CANCELED = 'canceled';
}
