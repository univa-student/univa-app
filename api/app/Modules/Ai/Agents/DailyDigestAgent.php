<?php

declare(strict_types=1);

namespace App\Modules\Ai\Agents;

use App\Models\User;
use App\Modules\Ai\DTO\DailyDigestContextData;
use App\Modules\Ai\DTO\GenerateDailyDigestData;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Prompts\DailyDigest\OutputRulesPrompt;
use App\Modules\Ai\Prompts\DailyDigest\SystemPrompt;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;
use Stringable;

#[Provider(Lab::Gemini)]
#[MaxTokens(4096)]
#[Temperature(0.2)]
#[Timeout(120)]
final class DailyDigestAgent implements Agent, Conversational, HasStructuredOutput, HasProviderOptions
{
    use Promptable;
    use RemembersConversations;

    private ?DailyDigestContextData $context = null;

    /**
     * @throws AiContextException
     */
    public function instructions(): Stringable|string
    {
        if (!$this->context instanceof DailyDigestContextData) {
            throw AiContextException::emptyContext('daily_digest');
        }

        return trim(
            SystemPrompt::build($this->context) . PHP_EOL . PHP_EOL .
            OutputRulesPrompt::build(),
        );
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->required(),
            'overview' => $schema->string()->required(),
            'focus' => $schema->string(),
            'alerts' => $schema->array()->items($schema->string())->required(),
            'lessons' => $schema->array()->items($schema->string())->required(),
            'deadlines' => $schema->array()->items($schema->string())->required(),
            'action_items' => $schema->array()->items($schema->string())->required(),
        ];
    }

    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::OpenAI => [
                'reasoning' => ['effort' => 'low'],
            ],
            Lab::Anthropic => [
                'thinking' => ['budget_tokens' => 1024],
            ],
            default => [],
        };
    }

    public function generate(
        DailyDigestContextData $context,
        AiProvider $provider,
        string $model,
        ?GenerateDailyDigestData $input = null,
        ?AiContextSession $session = null,
    ): AgentResponse {
        $this->context = $context;

        $prompt = $this->buildPrompt($context, $input);
        $lab = $this->toLab($provider);
        $user = $this->resolveUser($session);

        if (
            $session instanceof AiContextSession
            && $this->sessionConversationId($session) !== null
            && $user instanceof User
        ) {
            $response = $this->continue($this->sessionConversationId($session), as: $user)->prompt(
                $prompt,
                provider: $lab,
                model: $model,
            );
        } elseif ($user instanceof User) {
            $response = $this->forUser($user)->prompt(
                $prompt,
                provider: $lab,
                model: $model,
            );
        } else {
            $response = $this->prompt(
                $prompt,
                provider: $lab,
                model: $model,
            );
        }

        $this->storeConversationId($response, $session);

        return $response;
    }

    private function buildPrompt(
        DailyDigestContextData $context,
        ?GenerateDailyDigestData $input = null,
    ): string {
        $lines = [
            'Сформуй щоденний AI-дайджест для студента.',
            'Дата: ' . $context->date->toDateString(),
            'Ім\'я: ' . $context->userName,
            'Статистика: ' . json_encode($context->stats, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Сховище: ' . json_encode($context->storage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Пари сьогодні: ' . json_encode($context->todayLessons, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Пріоритетні дедлайни: ' . json_encode($context->priorityDeadlines, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'Недавні файли: ' . json_encode($context->recentFiles, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];

        if ($input?->forceRefresh === true) {
            $lines[] = 'Потрібно згенерувати оновлений digest, не перевикористовуй попередній текст.';
        }

        return implode(PHP_EOL, $lines);
    }

    private function toLab(AiProvider $provider): Lab
    {
        return match ($provider) {
            AiProvider::GEMINI => Lab::Gemini,
            AiProvider::OPENAI => Lab::OpenAI,
            AiProvider::ANTHROPIC => Lab::Anthropic,
        };
    }

    private function resolveUser(?AiContextSession $session = null): ?User
    {
        if (!$session instanceof AiContextSession) {
            return null;
        }

        if ($session->relationLoaded('user')) {
            $user = $session->getRelation('user');

            return $user instanceof User ? $user : null;
        }

        return User::query()->find($session->getAttribute('user_id'));
    }

    private function storeConversationId(mixed $response, ?AiContextSession $session = null): void
    {
        if (!$session instanceof AiContextSession) {
            return;
        }

        $conversationId = $this->extractConversationId($response);

        if ($conversationId === null || $this->sessionConversationId($session) === $conversationId) {
            return;
        }

        $session->forceFill([
            'agent_conversation_id' => $conversationId,
        ])->save();
    }

    private function extractConversationId(mixed $response): ?string
    {
        if (is_object($response) && isset($response->conversationId) && is_scalar($response->conversationId)) {
            $value = (string) $response->conversationId;

            return trim($value) !== '' ? $value : null;
        }

        if (is_array($response) && isset($response['conversationId']) && is_scalar($response['conversationId'])) {
            $value = (string) $response['conversationId'];

            return trim($value) !== '' ? $value : null;
        }

        return null;
    }

    private function sessionConversationId(AiContextSession $session): ?string
    {
        $value = $session->getAttribute('agent_conversation_id');

        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
