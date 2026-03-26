<?php

namespace App\Modules\Groups\Enums;

enum GroupPollStatus: string
{
    case Open = 'open';
    case Closed = 'closed';
}
