<?php

namespace App\Modules\Groups\Enums;

enum GroupAnnouncementType: string
{
    case Academic = 'academic';
    case Organizational = 'organizational';
    case Headman = 'headman';
    case Teacher = 'teacher';
    case System = 'system';
}
