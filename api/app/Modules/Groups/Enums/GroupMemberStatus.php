<?php

namespace App\Modules\Groups\Enums;

enum GroupMemberStatus: string
{
    case Active = 'active';
    case Invited = 'invited';
    case Pending = 'pending';
    case Blocked = 'blocked';
    case Left = 'left';
}
