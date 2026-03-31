<?php

namespace App\Modules\Planner\Enums;

enum PlannerBlockType: string
{
    case MANUAL = 'manual';
    case TASK = 'task';
    case DEADLINE = 'deadline';
    case LESSON = 'lesson';
    case FOCUS = 'focus';
    case BREAK = 'break';
}
