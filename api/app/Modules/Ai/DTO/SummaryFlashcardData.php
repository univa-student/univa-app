<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

final readonly class SummaryFlashcardData
{
    public function __construct(
        public string $question,
        public string $answer,
    ) {
    }

    public static function fromArray(array $data): ?self
    {
        $question = isset($data['question']) ? trim((string) $data['question']) : '';
        $answer = isset($data['answer']) ? trim((string) $data['answer']) : '';

        if ($question === '' || $answer === '') {
            return null;
        }

        return new self(
            question: $question,
            answer: $answer,
        );
    }

    public function toArray(): array
    {
        return [
            'question' => $this->question,
            'answer' => $this->answer,
        ];
    }
}
