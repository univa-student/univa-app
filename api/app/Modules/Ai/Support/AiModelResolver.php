<?php

declare(strict_types=1);

namespace App\Modules\Ai\Support;

use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Exceptions\AiProviderException;
use App\Modules\Settings\Models\ApplicationSetting;
use App\Modules\Settings\Services\SettingsService;
use Illuminate\Support\Facades\Config;
use ValueError;

final readonly class AiModelResolver
{
    /**
     * @param array<string, array<string, string>> $models
     */
    public function __construct(
        private SettingsService $settingsService,
        private string $defaultProvider = 'gemini',
        private array $models = [
            'default' => [
                'gemini' => 'gemini-2.5-flash-lite',
                'openai' => 'gpt-4.1-mini',
                'anthropic' => 'claude-3-5-haiku-latest',
            ],
            'summarize_file' => [
                'gemini' => 'gemini-2.5-flash-lite',
                'openai' => 'gpt-4.1-mini',
                'anthropic' => 'claude-3-5-haiku-latest',
            ],
            'generate_daily_digest' => [
                'gemini' => 'gemini-2.5-flash-lite',
                'openai' => 'gpt-4.1-mini',
                'anthropic' => 'claude-3-5-haiku-latest',
            ],
            'generate_planner_day_suggestions' => [
                'gemini' => 'gemini-2.5-flash-lite',
                'openai' => 'gpt-4.1-mini',
                'anthropic' => 'claude-3-5-haiku-latest',
            ],
        ],
    ) {
    }

    /**
     * @return array{provider: AiProvider, model: string}
     *
     * @throws AiProviderException
     */
    public function resolve(
        string $useCase,
        ?string $requestedModel = null,
        AiProvider|string|null $requestedProvider = null,
        ?int $userId = null,
    ): array {
        $provider = $this->resolveProvider($requestedProvider, $userId);
        $model = $this->resolveModel($provider, $useCase, $requestedModel);

        $this->applyProviderKeyOverride($provider, $userId);

        return [
            'provider' => $provider,
            'model' => $model,
        ];
    }

    /**
     * @throws AiProviderException
     */
    public function resolveProvider(
        AiProvider|string|null $requestedProvider = null,
        ?int $userId = null,
    ): AiProvider {
        if ($requestedProvider instanceof AiProvider) {
            return $requestedProvider;
        }

        $provider = trim((string) ($requestedProvider ?? $this->resolveUserProvider($userId) ?? $this->defaultProvider));

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

    private function resolveUserProvider(?int $userId): ?string
    {
        if ($userId === null) {
            return null;
        }

        return $this->settingsService->getEffectiveValueByKey(
            $userId,
            ApplicationSetting::AI_PROVIDER_SETTING_KEY,
        );
    }

    private function applyProviderKeyOverride(AiProvider $provider, ?int $userId): void
    {
        $settingKey = match ($provider) {
            AiProvider::GEMINI => ApplicationSetting::AI_GEMINI_API_KEY_SETTING_KEY,
            AiProvider::OPENAI => ApplicationSetting::AI_OPENAI_API_KEY_SETTING_KEY,
            AiProvider::ANTHROPIC => ApplicationSetting::AI_ANTHROPIC_API_KEY_SETTING_KEY,
        };

        $apiKey = $userId !== null
            ? $this->settingsService->getEffectiveValueByKey($userId, $settingKey)
            : null;

        Config::set(
            "ai.providers.{$provider->value}.key",
            $apiKey !== null && trim($apiKey) !== ''
                ? trim($apiKey)
                : $this->fallbackProviderKey($provider),
        );
    }

    private function fallbackProviderKey(AiProvider $provider): ?string
    {
        return match ($provider) {
            AiProvider::GEMINI => env('GEMINI_API_KEY'),
            AiProvider::OPENAI => env('OPENAI_API_KEY'),
            AiProvider::ANTHROPIC => env('ANTHROPIC_API_KEY'),
        };
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
