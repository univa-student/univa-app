<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiContextType: string
{
    case FILE = 'file';
    case SUBJECT = 'subject';
    case DEADLINE = 'deadline';
    case CHAT = 'chat';
    case EXAM = 'exam';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::FILE => 'File',
            self::SUBJECT => 'Subject',
            self::DEADLINE => 'Deadline',
            self::CHAT => 'Chat',
            self::EXAM => 'Exam',
        };
    }
}
