<?php

namespace App\Modules\Groups\Enums;

enum GroupJoinRequestStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
