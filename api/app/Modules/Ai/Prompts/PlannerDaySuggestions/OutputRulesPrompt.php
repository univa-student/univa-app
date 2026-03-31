<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\PlannerDaySuggestions;

final class OutputRulesPrompt
{
    public static function build(): string
    {
        return <<<PROMPT
Поверни тільки структурований результат за схемою.
Без markdown і без додаткових пояснень поза схемою.
PROMPT;
    }
}
