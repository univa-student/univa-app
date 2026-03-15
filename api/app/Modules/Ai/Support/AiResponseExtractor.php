<?php

declare(strict_types=1);

namespace App\Modules\Ai\Support;

use App\Modules\Ai\Exceptions\AiProviderException;
use JsonSerializable;

final class AiResponseExtractor
{
    /**
     * Повертає структурований масив для formatter-а.
     *
     * @return array<string, mixed>
     * @throws AiProviderException
     */
    public function extractStructured(mixed $response, string $provider = 'unknown'): array
    {
        $normalized = $this->normalize($response);

        $structured = $this->findStructuredCandidate($normalized);

        if ($structured === null) {
            $text = $this->extractText($response, $provider);

            return [
                'title' => 'Summary',
                'short_summary' => $text,
                'main_points' => [],
                'key_terms' => [],
                'possible_questions' => [],
            ];
        }

        return $structured;
    }

    /**
     * @throws AiProviderException
     */
    public function extractText(mixed $response, string $provider = 'unknown'): string
    {
        $normalized = $this->normalize($response);

        $text = $this->findFirstText($normalized);

        if ($text === null || trim($text) === '') {
            throw AiProviderException::emptyResponse($provider);
        }

        return trim($text);
    }

    /**
     * @return array<string, mixed>
     */
    public function extractUsage(mixed $response): array
    {
        $normalized = $this->normalize($response);

        return [
            'input_tokens' => $this->findFirstIntByKeys($normalized, [
                'input_tokens',
                'prompt_tokens',
                'inputTokens',
                'promptTokens',
            ]),
            'output_tokens' => $this->findFirstIntByKeys($normalized, [
                'output_tokens',
                'completion_tokens',
                'outputTokens',
                'completionTokens',
            ]),
            'total_tokens' => $this->findFirstIntByKeys($normalized, [
                'total_tokens',
                'totalTokens',
            ]),
            'latency_ms' => $this->findFirstIntByKeys($normalized, [
                'latency_ms',
                'latencyMs',
            ]),
            'raw_usage' => $this->findFirstArrayByKeys($normalized, [
                'usage',
                'token_usage',
                'tokenUsage',
            ]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function extractMeta(mixed $response): array
    {
        $normalized = $this->normalize($response);

        return [
            'id' => $this->findFirstScalarByKeys($normalized, ['id', 'response_id']),
            'provider_response_model' => $this->findFirstScalarByKeys($normalized, ['model']),
            'finish_reason' => $this->findFirstScalarByKeys($normalized, ['finish_reason', 'finishReason']),
        ];
    }

    /**
     * @return array<string, mixed>|list<mixed>|string|int|float|bool|null
     */
    private function normalize(mixed $value): array|string|int|float|bool|null
    {
        if ($value === null || is_scalar($value)) {
            return $value;
        }

        if (is_array($value)) {
            return $this->normalizeArray($value);
        }

        if ($value instanceof JsonSerializable) {
            return $this->normalize($value->jsonSerialize());
        }

        if (method_exists($value, 'toArray')) {
            return $this->normalize($value->toArray());
        }

        if (method_exists($value, '__toString')) {
            return (string) $value;
        }

        return $this->normalize(get_object_vars($value));
    }

    /**
     * @param array $value
     * @return array
     */
    private function normalizeArray(array $value): array
    {
        return array_map(function ($item) {
            return $this->normalize($item);
        }, $value);
    }

    /**
     * @param mixed $value
     * @return array<string, mixed>|null
     */
    private function findStructuredCandidate(mixed $value): ?array
    {
        if (!is_array($value)) {
            return null;
        }

        $keys = ['title', 'short_summary', 'main_points', 'key_terms', 'possible_questions'];

        if ($this->containsAnyKey($value, $keys)) {
            return [
                'title' => $this->stringOrDefault($value['title'] ?? null, 'Summary'),
                'short_summary' => $this->nullableString($value['short_summary'] ?? null),
                'main_points' => $this->normalizeStringList($value['main_points'] ?? []),
                'key_terms' => $this->normalizeStringList($value['key_terms'] ?? []),
                'possible_questions' => $this->normalizeStringList($value['possible_questions'] ?? []),
            ];
        }

        foreach ($value as $item) {
            $found = $this->findStructuredCandidate($item);

            if ($found !== null) {
                return $found;
            }
        }

        return null;
    }

    private function findFirstText(mixed $value): ?string
    {
        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }

        if (!is_array($value)) {
            return null;
        }

        foreach ([
                     'text',
                     'content',
                     'output_text',
                     'outputText',
                     'message',
                     'response',
                     'summary',
                     'short_summary',
                 ] as $preferredKey) {
            if (array_key_exists($preferredKey, $value)) {
                $text = $this->findFirstText($value[$preferredKey]);

                if ($text !== null) {
                    return $text;
                }
            }
        }

        foreach ($value as $item) {
            $text = $this->findFirstText($item);

            if ($text !== null) {
                return $text;
            }
        }

        return null;
    }

    /**
     * @param array<int, string> $keys
     */
    private function findFirstIntByKeys(mixed $value, array $keys): ?int
    {
        $scalar = $this->findFirstScalarByKeys($value, $keys);

        if ($scalar === null || $scalar === '') {
            return null;
        }

        return (int) $scalar;
    }

    /**
     * @param array<int, string> $keys
     * @return array<string, mixed>|array<int, mixed>|null
     */
    private function findFirstArrayByKeys(mixed $value, array $keys): ?array
    {
        if (!is_array($value)) {
            return null;
        }

        foreach ($keys as $key) {
            if (array_key_exists($key, $value) && is_array($value[$key])) {
                return $value[$key];
            }
        }

        foreach ($value as $item) {
            $found = $this->findFirstArrayByKeys($item, $keys);

            if ($found !== null) {
                return $found;
            }
        }

        return null;
    }

    /**
     * @param array<int, string> $keys
     */
    private function findFirstScalarByKeys(mixed $value, array $keys): string|int|float|bool|null
    {
        if (!is_array($value)) {
            return null;
        }

        foreach ($keys as $key) {
            if (array_key_exists($key, $value) && is_scalar($value[$key])) {
                return $value[$key];
            }
        }

        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }

            $found = $this->findFirstScalarByKeys($item, $keys);

            if ($found !== null) {
                return $found;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $value
     * @param array<int, string> $keys
     */
    private function containsAnyKey(array $value, array $keys): bool
    {
        return array_any($keys, fn($key) => array_key_exists($key, $value));
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

    private function stringOrDefault(mixed $value, string $default): string
    {
        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }

        return $default;
    }

    private function nullableString(mixed $value): ?string
    {
        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }

        return null;
    }
}
