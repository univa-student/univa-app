<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\PlannerDaySuggestions;

use App\Modules\Ai\DTO\PlannerDaySuggestionContextData;

final class SystemPrompt
{
    public static function build(PlannerDaySuggestionContextData $context): string
    {
        return <<<PROMPT
Ти AI-помічник планування в Univa.
Сформуй реалістичну чернетку дня українською мовою.

Правила:
- працюй лише з переданими слотами, задачами, дедлайнами і блоками;
- не створюй накладок з уроками або існуючими planner blocks;
- пріоритезуй дедлайни, близькі задачі та planning gaps;
- повертай тільки структурований результат за схемою.
PROMPT;
    }
}
