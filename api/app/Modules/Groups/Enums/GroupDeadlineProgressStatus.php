<?php

namespace App\Modules\Groups\Enums;

enum GroupDeadlineProgressStatus: string
{
    case NotStarted = 'not_started';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
