<?php

namespace App\Modules\User\Enums;

enum FriendshipStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
}
