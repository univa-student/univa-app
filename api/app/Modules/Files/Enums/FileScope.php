<?php

namespace App\Modules\Files\Enums;

enum FileScope: string
{
    case Personal = 'personal';
    case Subject  = 'subject';
    case Group    = 'group';
}
