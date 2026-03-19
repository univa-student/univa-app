/**
 * entities/llm-model/model/types.ts
 *
 * LLM (Large Language Model) domain types.
 */

export type LlmProvider = "openai" | "anthropic" | "google" | "ollama" | "other";

export interface LlmModel {
    id: number;
    name: string;          // display name, e.g. "GPT-4o"
    slug: string;          // API identifier, e.g. "gpt-4o"
    provider: LlmProvider;
    description: string | null;
    isDefault: boolean;
    contextWindow: number;        // max tokens
}
