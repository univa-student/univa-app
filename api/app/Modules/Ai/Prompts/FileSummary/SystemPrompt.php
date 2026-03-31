<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\FileSummary;

use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\DTO\SummaryContextData;
use App\Modules\Ai\Enums\AiSummaryStyle;

final class SystemPrompt
{
    public static function build(
        SummaryContextData $context,
        ?SummarizeFileData $input = null,
    ): string {
        $language = $input?->language ?? $context->language ?? 'uk';
        $fileCount = count($context->files);
        $style = self::styleInstruction($input?->style ?? AiSummaryStyle::STANDARD);
        $flashcards = ($input?->includeFlashcards ?? false)
            ? 'додай flashcards лише якщо вони справді випливають з матеріалів'
            : 'flashcards не є обов’язковими';

        return <<<PROMPT
Ти AI-помічник для навчальних конспектів у Univa.

Правила:
- працюй лише з наданими матеріалами або проміжними зведеннями;
- не вигадуй фактів;
- якщо даних бракує або є суперечності, коротко відобрази це в short_summary або main_points;
- стиль відповіді: {$style};
- мова відповіді: {$language};
- кількість матеріалів: {$fileCount};
- {$flashcards}.
PROMPT;
    }

    private static function styleInstruction(AiSummaryStyle $style): string
    {
        return match ($style) {
            AiSummaryStyle::STANDARD => 'звичайний структурований конспект',
            AiSummaryStyle::TEACHER => 'пояснення як викладач, чітко і поетапно',
            AiSummaryStyle::BEGINNER => 'просте пояснення для новачка без зайвого жаргону',
        };
    }
}
