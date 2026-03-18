<?php

namespace App\Modules\Notification\Enums;

enum NotificationType: string
{
    case PROFILE_UPDATED = 'profile_updated';
    case PASSWORD_CHANGED = 'password_changed';
    case AVATAR_UPDATED = 'avatar_updated';
    
    case FILE_UPLOADED = 'file_uploaded';
    
    case AI_SUMMARY_CREATED = 'ai_summary_created';
    
    case EXAM_CREATED = 'exam_created';
    case EXAM_UPDATED = 'exam_updated';
    case SCHEDULE_EXCEPTION_CREATED = 'schedule_exception_created';
}
