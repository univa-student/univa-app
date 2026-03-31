<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiArtifactType;
use App\Modules\Ai\Enums\AiSummaryStyle;

final readonly class SummaryArtifactData
{
    /**
     * @param array<int, string> $mainPoints
     * @param array<int, string> $keyTerms
     * @param array<int, string> $possibleQuestions
     * @param array<int, SummaryFlashcardData> $flashcards
     * @param array<string, mixed> $meta
     */
    public function __construct(
        public string $title,
        public ?string $shortSummary = null,
        public array $mainPoints = [],
        public array $keyTerms = [],
        public array $possibleQuestions = [],
        public array $flashcards = [],
        public ?string $contentText = null,
        public array $meta = [],
        public AiSummaryStyle $style = AiSummaryStyle::STANDARD,
    ) {
    }

    public static function fromArray(array $data): self
    {
        $style = $data['style'] ?? AiSummaryStyle::STANDARD;

        if (!$style instanceof AiSummaryStyle) {
            $style = AiSummaryStyle::from((string) $style);
        }

        return new self(
            title: (string) ($data['title'] ?? 'Summary'),
            shortSummary: isset($data['short_summary']) ? (string) $data['short_summary'] : null,
            mainPoints: self::normalizeStringList($data['main_points'] ?? []),
            keyTerms: self::normalizeStringList($data['key_terms'] ?? []),
            possibleQuestions: self::normalizeStringList($data['possible_questions'] ?? []),
            flashcards: self::normalizeFlashcards($data['flashcards'] ?? []),
            contentText: isset($data['content_text']) ? (string) $data['content_text'] : null,
            meta: isset($data['meta']) && is_array($data['meta']) ? $data['meta'] : [],
            style: $style,
        );
    }

    public function type(): AiArtifactType
    {
        return AiArtifactType::SUMMARY;
    }

    public function toContentJson(): array
    {
        return [
            'title' => $this->title,
            'short_summary' => $this->shortSummary,
            'main_points' => $this->mainPoints,
            'key_terms' => $this->keyTerms,
            'possible_questions' => $this->possibleQuestions,
            'flashcards' => array_map(
                static fn (SummaryFlashcardData $flashcard): array => $flashcard->toArray(),
                $this->flashcards,
            ),
            'meta' => $this->meta,
            'style' => $this->style->value,
        ];
    }

    public function toContentText(): string
    {
        if ($this->contentText !== null && trim($this->contentText) !== '') {
            return $this->contentText;
        }

        $parts = [];

        $parts[] = $this->title;

        if ($this->shortSummary) {
            $parts[] = $this->shortSummary;
        }

        if ($this->mainPoints !== []) {
            $parts[] = 'Основні думки:';
            foreach ($this->mainPoints as $point) {
                $parts[] = '- ' . $point;
            }
        }

        if ($this->keyTerms !== []) {
            $parts[] = 'Ключові терміни: ' . implode(', ', $this->keyTerms);
        }

        if ($this->possibleQuestions !== []) {
            $parts[] = 'Можливі запитання:';
            foreach ($this->possibleQuestions as $question) {
                $parts[] = '- ' . $question;
            }
        }

        if ($this->flashcards !== []) {
            $parts[] = 'Флеш-картки:';
            foreach ($this->flashcards as $flashcard) {
                $parts[] = '- ' . $flashcard->question . ' -> ' . $flashcard->answer;
            }
        }

        return implode(PHP_EOL . PHP_EOL, array_filter($parts));
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type()->value,
            'title' => $this->title,
            'short_summary' => $this->shortSummary,
            'main_points' => $this->mainPoints,
            'key_terms' => $this->keyTerms,
            'possible_questions' => $this->possibleQuestions,
            'flashcards' => array_map(
                static fn (SummaryFlashcardData $flashcard): array => $flashcard->toArray(),
                $this->flashcards,
            ),
            'content_text' => $this->contentText,
            'meta' => $this->meta,
            'style' => $this->style->value,
        ];
    }

    private static function normalizeStringList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $items = [];

        foreach ($value as $item) {
            if (is_string($item) && trim($item) !== '') {
                $items[] = trim($item);
            }
        }

        return array_values($items);
    }

    /**
     * @param mixed $value
     * @return array<int, SummaryFlashcardData>
     */
    private static function normalizeFlashcards(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $items = [];

        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }

            $flashcard = SummaryFlashcardData::fromArray($item);

            if ($flashcard instanceof SummaryFlashcardData) {
                $items[] = $flashcard;
            }
        }

        return array_values($items);
    }
}
