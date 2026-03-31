<?php

namespace App\Modules\Planner\Enums;

enum PlannerSourceType: string
{
    case TASK = 'task';
    case DEADLINE = 'deadline';
    case LESSON = 'lesson';
    case SUBJECT = 'subject';
}
