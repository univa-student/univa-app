<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\FileSummary;

final class OutputRulesPrompt
{
    public static function build(): string
    {
        return <<<'PROMPT'
Поверни тільки структурований результат згідно заданої схеми.
Не додавай markdown, зайвих полів або пояснень поза схемою.
PROMPT;
    }
}
