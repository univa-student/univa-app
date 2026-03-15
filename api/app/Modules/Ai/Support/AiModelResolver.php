<?php

declare(strict_types=1);

namespace App\Modules\Ai\Support;

use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Exceptions\AiProviderException;
use ValueError;

final readonly class AiModelResolver
{
    /**
     * @param array<string, array<string, string>> $models
     */
    public function __construct(
        private string $defaultProvider = 'gemini',
        private array $models = [
            'default' => [
                'gemini' => 'gemini-2.5-flash',
                'openai' => 'gpt-4.1-mini',
                'anthropic' => 'claude-3-5-haiku-latest',
            ],
            'summarize_file' => [
                'gemini' => 'gemini-2.5-flash',
                'openai' => 'gpt-4.1-mini',
                'anthropic' => 'claude-3-5-haiku-latest',
            ],
        ],
    ) {
    }

    /**
     * @return array{provider: AiProvider, model: string}
     * @throws AiProviderException
     */
    public function resolve(
        string $useCase,
        ?string $requestedModel = null,
        AiProvider|string|null $requestedProvider = null,
    ): array {
        $provider = $this->resolveProvider($requestedProvider);
        $model = $this->resolveModel($provider, $useCase, $requestedModel);

        return [
            'provider' => $provider,
            'model' => $model,
        ];
    }

    /**
     * @throws AiProviderException
     */
    public function resolveProvider(AiProvider|string|null $requestedProvider = null): AiProvider
    {
        if ($requestedProvider instanceof AiProvider) {
            return $requestedProvider;
        }

        $provider = trim((string) ($requestedProvider ?? $this->defaultProvider));

        try {
            return AiProvider::from($provider);
        } catch (ValueError) {
            throw AiProviderException::unsupportedProvider($provider);
        }
    }

    /**
     * @throws AiProviderException
     */
    public function resolveModel(
        AiProvider $provider,
        string $useCase,
        ?string $requestedModel = null,
    ): string {
        if ($requestedModel !== null && trim($requestedModel) !== '') {
            return trim($requestedModel);
        }

        $useCaseKey = $this->normalizeUseCase($useCase);
        $providerKey = $provider->value;

        $model = $this->models[$useCaseKey][$providerKey]
            ?? $this->models['default'][$providerKey]
            ?? null;

        if ($model === null || trim($model) === '') {
            throw AiProviderException::modelNotResolved($provider, $requestedModel);
        }

        return trim($model);
    }

    private function normalizeUseCase(string $useCase): string
    {
        $useCase = trim($useCase);

        if ($useCase === '') {
            return 'default';
        }

        if (str_contains($useCase, '\\')) {
            $parts = explode('\\', $useCase);
            $useCase = end($parts) ?: $useCase;
        }

        $normalized = strtolower((string) preg_replace('/(?<!^)[A-Z]/', '_$0', $useCase));
        $normalized = str_replace(['-', ' '], '_', $normalized);

        return trim($normalized, '_') ?: 'default';
    }
}
