<?php

declare(strict_types=1);

namespace App\Modules\Ai\Formatters;

use App\Modules\Ai\Contracts\ArtifactFormatterContract;
use App\Modules\Ai\DTO\DailyDigestArtifactData;
use App\Modules\Ai\DTO\DailyDigestContextData;
use App\Modules\Ai\DTO\GenerateDailyDigestData;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Exceptions\AiProviderException;
use App\Modules\Ai\Support\AiResponseExtractor;

final readonly class DailyDigestArtifactFormatter implements ArtifactFormatterContract
{
    public function __construct(
        private AiResponseExtractor $responseExtractor,
    ) {
    }

    /**
     * @throws AiContextException
     * @throws AiProviderException
     */
    public function format(mixed $response, object $context, ?object $input = null): object
    {
        if (!$context instanceof DailyDigestContextData) {
            throw AiContextException::invalidDto(
                DailyDigestContextData::class,
                get_debug_type($context),
            );
        }

        if ($input !== null && !$input instanceof GenerateDailyDigestData) {
            throw AiContextException::invalidDto(
                GenerateDailyDigestData::class,
                get_debug_type($input),
            );
        }

        return $this->formatDigest($response, $context, $input);
    }

    /**
     * @throws AiProviderException
     */
    public function formatDigest(
        mixed $response,
        DailyDigestContextData $context,
        ?GenerateDailyDigestData $input = null,
    ): DailyDigestArtifactData {
        $structured = $this->responseExtractor->extractStructuredByKeys(
            response: $response,
            keys: ['title', 'overview', 'focus', 'alerts', 'lessons', 'deadlines', 'action_items'],
            provider: $input?->model ?? 'unknown',
        );

        $title = $this->stringValue($structured['title'] ?? null) ?? 'AI-дайджест дня';
        $overview = $this->stringValue($structured['overview'] ?? null)
            ?? 'Зведення дня підготовлено на основі твого розкладу, дедлайнів і файлів.';
        $focus = $this->stringValue($structured['focus'] ?? null);
        $alerts = $this->normalizeStringList($structured['alerts'] ?? []);
        $actionItems = $this->normalizeStringList($structured['action_items'] ?? []);

        $lessons = $this->normalizeObjectList($structured['lessons'] ?? [], ['subject', 'time', 'note']);
        $deadlines = $this->normalizeObjectList($structured['deadlines'] ?? [], ['title', 'due_at', 'priority']);

        return new DailyDigestArtifactData(
            title: $title,
            overview: $overview,
            focus: $focus,
            alerts: $alerts,
            lessons: $lessons,
            deadlines: $deadlines,
            actionItems: $actionItems,
            contentText: $this->buildContentText($title, $overview, $focus, $alerts, $actionItems),
            meta: [
                'generated_for_date' => $context->date->toDateString(),
                'user_name' => $context->userName,
                'stats' => $context->stats,
                'storage' => $context->storage,
                'source' => 'ai',
                'mode' => $input?->mode->value,
            ],
        );
    }

    private function stringValue(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }

    /**
     * @param mixed $value
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
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
     * @param array<int, string> $allowedKeys
     * @return array<int, array<string, string|null>>
     */
    private function normalizeObjectList(mixed $value, array $allowedKeys): array
    {
        if (!is_array($value)) {
            return [];
        }

        $items = [];

        foreach ($value as $item) {
            if (is_string($item) && trim($item) !== '') {
                $normalized = array_fill_keys($allowedKeys, null);
                $normalized[$allowedKeys[0]] = trim($item);
                $items[] = $normalized;
                continue;
            }

            if (!is_array($item)) {
                continue;
            }

            $normalized = [];

            foreach ($allowedKeys as $key) {
                $normalized[$key] = isset($item[$key]) && is_scalar($item[$key])
                    ? trim((string) $item[$key])
                    : null;
            }

            $items[] = $normalized;
        }

        return array_values($items);
    }

    /**
     * @param array<int, string> $alerts
     * @param array<int, string> $actionItems
     */
    private function buildContentText(
        string $title,
        string $overview,
        ?string $focus,
        array $alerts,
        array $actionItems,
    ): string {
        $parts = [$title, $overview];

        if ($focus !== null) {
            $parts[] = 'Фокус дня: ' . $focus;
        }

        if ($alerts !== []) {
            $parts[] = 'Важливе:' . PHP_EOL . implode(PHP_EOL, array_map(
                static fn (string $item): string => '- ' . $item,
                $alerts,
            ));
        }

        if ($actionItems !== []) {
            $parts[] = 'Дії:' . PHP_EOL . implode(PHP_EOL, array_map(
                static fn (string $item): string => '- ' . $item,
                $actionItems,
            ));
        }

        return implode(PHP_EOL . PHP_EOL, $parts);
    }
}
