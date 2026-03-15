<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\FileSummary;

final class OutputRulesPrompt
{
    public static function build(): string
    {
        return <<<'PROMPT'
Поверни результат у строго структурованому вигляді з такими полями:

- title: string
- short_summary: string|null
- main_points: string[]
- key_terms: string[]
- possible_questions: string[]

Правила:
1. title — короткий заголовок конспекту.
2. short_summary — 1 короткий абзац із суттю документа.
3. main_points — список основних тез документа.
4. key_terms — список важливих термінів або понять.
5. possible_questions — список запитань для самоперевірки за матеріалом.
6. Не додавай зайвих полів.
7. Не додавай markdown-розмітку.
8. Не додавай пояснень поза структурою.
9. Якщо якоїсь інформації у файлі немає, повертай порожній список або null, а не вигадані дані.
PROMPT;
    }
}
