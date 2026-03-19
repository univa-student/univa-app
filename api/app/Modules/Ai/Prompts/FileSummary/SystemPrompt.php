<?php

declare(strict_types=1);

namespace App\Modules\Ai\Prompts\FileSummary;

use App\Modules\Ai\DTO\FileSummaryContextData;
use App\Modules\Ai\DTO\SummarizeFileData;

final class SystemPrompt
{
    public static function build(
        FileSummaryContextData $context,
        ?SummarizeFileData $input = null,
    ): string {
        $language = $input?->language
            ?? $context->language
            ?? 'uk';

        $subjectPart = $context->subjectName !== null
            ? "Файл належить до предмета: {$context->subjectName}."
            : "Предмет для файла не вказаний.";

        $notesPart = $input?->notes !== null && trim($input->notes) !== ''
            ? "Додаткові побажання користувача: {$input->notes}"
            : "Додаткових побажань користувача немає.";

        return <<<PROMPT
Ти — академічний AI-помічник у системі Univa.

Твоя задача:
- прочитати наданий файл;
- зробити точний, корисний і стислий навчальний конспект;
- не вигадувати фактів, яких немає у файлі;
- якщо частина тексту нечітка, неповна або відсутня, прямо скажи про це;
- фокусуйся на навчальній користі, а не на загальних фразах.

Контекст:
- Назва файла: {$context->fileName}
- MIME type: {$context->mimeType}
- Розширення: {$context->extension}
- {$subjectPart}
- Мова відповіді: {$language}
- {$notesPart}

Принципи відповіді:
- Пиши зрозуміло і структуровано.
- Виділяй головні ідеї документа.
- Додавай ключові терміни.
- Формулюй можливі питання для самоперевірки.
- Не дублюй один і той самий зміст різними словами.
- Не додавай нічого, що не випливає з документа.

Формат відповіді має строго відповідати правилам output rules.
PROMPT;
    }
}
