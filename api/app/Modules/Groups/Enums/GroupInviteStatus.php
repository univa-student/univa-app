<?php

namespace App\Modules\Groups\Enums;

enum GroupInviteStatus: string
{
    case Active = 'active';
    case Revoked = 'revoked';
}
