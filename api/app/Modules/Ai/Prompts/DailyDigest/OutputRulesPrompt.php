<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\DailyDigest;

final class OutputRulesPrompt
{
    public static function build(): string
    {
        return <<<PROMPT
Поверни тільки структурований результат у такому форматі:
- title: короткий заголовок дайджесту
- overview: 1 короткий абзац зі зведенням дня
- focus: 1 головний фокус дня
- alerts: масив коротких важливих сигналів
- lessons: масив коротких рядків про головні пари або події
- deadlines: масив коротких рядків про головні дедлайни
- action_items: масив коротких дій
PROMPT;
    }
}
