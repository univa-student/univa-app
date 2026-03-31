<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiSessionMode: string
{
    case SUMMARY = 'summary';
    case DAILY_DIGEST = 'daily_digest';
    case EXPLAIN = 'explain';
    case QUIZ = 'quiz';
    case STUDY_PLAN = 'study_plan';
    case ANALYZE = 'analyze';
    case PLANNER = 'planner';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::SUMMARY => 'Summary',
            self::DAILY_DIGEST => 'Daily digest',
            self::EXPLAIN => 'Explain',
            self::QUIZ => 'Quiz',
            self::STUDY_PLAN => 'Study plan',
            self::ANALYZE => 'Analyze',
            self::PLANNER => 'Planner',
        };
    }
}
