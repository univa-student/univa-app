<?php

declare(strict_types=1);

namespace App\Modules\Ai\DTO;

use App\Modules\Ai\Enums\AiArtifactType;

final readonly class DailyDigestArtifactData
{
    /**
     * @param array<int, string> $alerts
     * @param array<int, array<string, string|null>> $lessons
     * @param array<int, array<string, string|null>> $deadlines
     * @param array<int, string> $actionItems
     * @param array<string, mixed> $meta
     */
    public function __construct(
        public string $title,
        public string $overview,
        public ?string $focus = null,
        public array $alerts = [],
        public array $lessons = [],
        public array $deadlines = [],
        public array $actionItems = [],
        public ?string $contentText = null,
        public array $meta = [],
    ) {
    }

    public function type(): AiArtifactType
    {
        return AiArtifactType::DAILY_DIGEST;
    }

    public function toContentJson(): array
    {
        return [
            'title' => $this->title,
            'overview' => $this->overview,
            'focus' => $this->focus,
            'alerts' => $this->alerts,
            'lessons' => $this->lessons,
            'deadlines' => $this->deadlines,
            'action_items' => $this->actionItems,
            'meta' => $this->meta,
        ];
    }

    public function toContentText(): string
    {
        if ($this->contentText !== null && trim($this->contentText) !== '') {
            return $this->contentText;
        }

        $parts = [$this->title, $this->overview];

        if ($this->focus !== null && trim($this->focus) !== '') {
            $parts[] = 'Фокус дня: ' . $this->focus;
        }

        if ($this->alerts !== []) {
            $parts[] = 'Важливе:' . PHP_EOL . implode(PHP_EOL, array_map(
                static fn (string $item): string => '- ' . $item,
                $this->alerts,
            ));
        }

        if ($this->actionItems !== []) {
            $parts[] = 'Що зробити:' . PHP_EOL . implode(PHP_EOL, array_map(
                static fn (string $item): string => '- ' . $item,
                $this->actionItems,
            ));
        }

        return implode(PHP_EOL . PHP_EOL, array_filter($parts));
    }
}
