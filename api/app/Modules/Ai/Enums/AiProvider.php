<?php

declare(strict_types=1);

namespace App\Modules\Ai\Enums;

enum AiProvider: string
{
    case GEMINI = 'gemini';
    case OPENAI = 'openai';
    case ANTHROPIC = 'anthropic';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::GEMINI => 'Gemini',
            self::OPENAI => 'OpenAI',
            self::ANTHROPIC => 'Anthropic',
        };
    }

    public function supportsFileAttachments(): bool
    {
        return match ($this) {
            self::GEMINI,
            self::OPENAI,
            self::ANTHROPIC => true,
        };
    }
}
