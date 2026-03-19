<?php

declare(strict_types=1);

namespace App\Modules\Ai\Exceptions;

use App\Modules\Ai\Enums\AiProvider;
use Throwable;

final class AiProviderException extends AiException
{
    public static function unsupportedProvider(string $provider): self
    {
        return new self(
            message: "AI provider [{$provider}] не підтримується.",
            context: [
                'provider' => $provider,
            ],
        );
    }

    public static function modelNotResolved(AiProvider|string $provider, ?string $model = null): self
    {
        $providerValue = $provider instanceof AiProvider ? $provider->value : $provider;

        return new self(
            message: 'Не вдалося визначити AI-модель для поточного сценарію.',
            context: [
                'provider' => $providerValue,
                'model' => $model,
            ],
        );
    }

    public static function requestFailed(
        AiProvider|string $provider,
        string $message = 'Помилка запиту до AI provider.',
        array $context = [],
        ?Throwable $previous = null,
    ): self {
        $providerValue = $provider instanceof AiProvider ? $provider->value : $provider;

        return new self(
            message: $message,
            context: array_merge($context, [
                'provider' => $providerValue,
            ]),
            previous: $previous,
        );
    }

    public static function emptyResponse(AiProvider|string $provider, ?string $model = null): self
    {
        $providerValue = $provider instanceof AiProvider ? $provider->value : $provider;

        return new self(
            message: 'AI provider повернув порожню або невалідну відповідь.',
            context: [
                'provider' => $providerValue,
                'model' => $model,
            ],
        );
    }

    public static function invalidStructuredResponse(
        AiProvider|string $provider,
        array $context = [],
    ): self {
        $providerValue = $provider instanceof AiProvider ? $provider->value : $provider;

        return new self(
            message: 'AI provider повернув відповідь, яка не відповідає очікуваній структурі.',
            context: array_merge($context, [
                'provider' => $providerValue,
            ]),
        );
    }
}
