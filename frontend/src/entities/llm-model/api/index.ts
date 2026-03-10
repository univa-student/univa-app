/**
 * entities/llm-model/api/index.ts
 *
 * LLM model API — list available models.
 */
import { apiFetch } from "@/shared/api/http";
import type { LlmModel } from "../model/types";

const API = "/api/v1";

export function listModels(): Promise<LlmModel[]> {
    return apiFetch<LlmModel[]>(`${API}/ai/models`);
}
