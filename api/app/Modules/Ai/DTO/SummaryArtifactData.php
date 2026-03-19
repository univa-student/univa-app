<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiArtifactType;

final readonly class SummaryArtifactData
{
    /**
     * @param array<int, string> $mainPoints
     * @param array<int, string> $keyTerms
     * @param array<int, string> $possibleQuestions
     * @param array<string, mixed> $meta
     */
    public function __construct(
        public string $title,
        public ?string $shortSummary = null,
        public array $mainPoints = [],
        public array $keyTerms = [],
        public array $possibleQuestions = [],
        public ?string $contentText = null,
        public array $meta = [],
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            title: (string) ($data['title'] ?? 'Summary'),
            shortSummary: isset($data['short_summary']) ? (string) $data['short_summary'] : null,
            mainPoints: self::normalizeStringList($data['main_points'] ?? []),
            keyTerms: self::normalizeStringList($data['key_terms'] ?? []),
            possibleQuestions: self::normalizeStringList($data['possible_questions'] ?? []),
            contentText: isset($data['content_text']) ? (string) $data['content_text'] : null,
            meta: isset($data['meta']) && is_array($data['meta']) ? $data['meta'] : [],
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
            'meta' => $this->meta,
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
            'content_text' => $this->contentText,
            'meta' => $this->meta,
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
}
