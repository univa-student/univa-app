<?php

declare(strict_types=1);

namespace App\Modules\Ai\Agents;

use App\Models\User;
use App\Modules\Ai\DTO\FileSummaryContextData;
use App\Modules\Ai\DTO\SummarizeFileData;
use App\Modules\Ai\Enums\AiProvider;
use App\Modules\Ai\Exceptions\AiContextException;
use App\Modules\Ai\Models\AiContextSession;
use App\Modules\Ai\Prompts\FileSummary\OutputRulesPrompt;
use App\Modules\Ai\Prompts\FileSummary\SystemPrompt;
use DomainException;
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
use Laravel\Ai\Files;
use Laravel\Ai\Files\LocalDocument;
use Laravel\Ai\Files\StoredDocument;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;
use Stringable;

#[Provider(Lab::Gemini)]
#[MaxTokens(4096)]
#[Temperature(0.2)]
#[Timeout(120)]
final class FileSummaryAgent implements Agent, Conversational, HasStructuredOutput, HasProviderOptions
{
    use Promptable;
    use RemembersConversations;

    private ?FileSummaryContextData $context = null;
    private ?SummarizeFileData $input = null;

    /**
     * @throws AiContextException
     */
    public function instructions(): Stringable|string
    {
        if (!$this->context instanceof FileSummaryContextData) {
            throw AiContextException::emptyContext('file');
        }

        return trim(
            SystemPrompt::build($this->context, $this->input) . PHP_EOL . PHP_EOL .
            OutputRulesPrompt::build()
        );
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->required(),
            'short_summary' => $schema->string(),
            'main_points' => $schema->array()->items($schema->string())->required(),
            'key_terms' => $schema->array()->items($schema->string())->required(),
            'possible_questions' => $schema->array()->items($schema->string())->required(),
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

    /**
     * @param array{
     *     disk: string,
     *     path: string,
     *     absolute_path: string|null,
     *     file_name: string,
     *     mime_type: string|null,
     *     extension: string|null,
     *     size: int|null
     * } $attachment
     *
     */
    public function summarize(
        FileSummaryContextData $context,
        array $attachment,
        AiProvider $provider,
        string $model,
        ?SummarizeFileData $input = null,
        ?AiContextSession $session = null,
    ): AgentResponse
    {
        $this->context = $context;
        $this->input = $input;

        $prompt = $this->buildPrompt($context, $input);
        $attachments = [$this->toDocumentAttachment($attachment)];
        $lab = $this->toLab($provider);

        $response = $this->promptThroughConversation(
            prompt: $prompt,
            provider: $lab,
            model: $model,
            attachments: $attachments,
            session: $session,
        );

        $this->storeConversationId($response, $session);

        return $response;
    }

    private function buildPrompt(
        FileSummaryContextData $context,
        ?SummarizeFileData $input = null,
    ): string {
        $language = $input?->language
            ?? $context->language
            ?? 'uk';

        $notes = $input?->notes !== null && trim($input->notes) !== ''
            ? 'Додаткові побажання: ' . trim($input->notes) . PHP_EOL
            : '';

        return <<<PROMPT
Створи структурований конспект вкладеного документа.

Вимоги:
- мова відповіді: {$language}
- файл: {$context->fileName}
- будь точним і не вигадуй фактів
- якщо документ частково нечитабельний або неповний, прямо вкажи це
- поверни тільки структурований результат згідно з output rules

{$notes}
PROMPT;
    }

    /**
     * @param array<int, LocalDocument|StoredDocument|mixed> $attachments
     */
    private function promptThroughConversation(
        string $prompt,
        Lab $provider,
        string $model,
        array $attachments,
        ?AiContextSession $session = null,
    ): AgentResponse
    {
        $user = $this->resolveUser($session);

        if (
            $session instanceof AiContextSession
            && $this->sessionConversationId($session) !== null
            && $user instanceof User
        ) {
            return $this->continue($this->sessionConversationId($session), as: $user)->prompt(
                $prompt,
                attachments: $attachments,
                provider: $provider,
                model: $model,
            );
        }

        if ($user instanceof User) {
            return $this->forUser($user)->prompt(
                $prompt,
                attachments: $attachments,
                provider: $provider,
                model: $model,
            );
        }

        return $this->prompt(
            $prompt,
            attachments: $attachments,
            provider: $provider,
            model: $model,
        );
    }

    /**
     * @param array{
     *     disk: string,
     *     path: string,
     *     absolute_path: string|null,
     *     file_name: string,
     *     mime_type: string|null,
     *     extension: string|null,
     *     size: int|null
     * } $attachment
     */
    private function toDocumentAttachment(array $attachment): LocalDocument|StoredDocument
    {
        $absolutePath = $attachment['absolute_path'] ?? null;
        $path = $attachment['path'] ?? null;
        $disk = $attachment['disk'] ?? null;

        if (is_string($absolutePath) && trim($absolutePath) !== '') {
            return Files\Document::fromPath($absolutePath);
        }

        if (is_string($path) && trim($path) !== '') {
            if (is_string($disk) && trim($disk) !== '') {
                return Files\Document::fromStorage($path, disk: $disk);
            }

            return Files\Document::fromStorage($path);
        }

        throw new DomainException('Не вдалося підготувати AI attachment для документа.');
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

        if ($conversationId === null) {
            return;
        }

        if ($this->sessionConversationId($session) === $conversationId) {
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
