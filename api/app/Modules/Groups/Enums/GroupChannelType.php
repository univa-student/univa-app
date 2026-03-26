<?php

namespace App\Modules\Groups\Enums;

enum GroupChannelType: string
{
    case General = 'general';
    case Announcements = 'announcements';
    case Subject = 'subject';
    case Custom = 'custom';
}
