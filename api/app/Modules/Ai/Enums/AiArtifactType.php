<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiArtifactType: string
{
    case SUMMARY = 'summary';
    case EXPLANATION = 'explanation';
    case QUIZ = 'quiz';
    case STUDY_PLAN = 'study_plan';
    case ANALYSIS = 'analysis';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::SUMMARY => 'Summary',
            self::EXPLANATION => 'Explanation',
            self::QUIZ => 'Quiz',
            self::STUDY_PLAN => 'Study plan',
            self::ANALYSIS => 'Analysis',
        };
    }
}
