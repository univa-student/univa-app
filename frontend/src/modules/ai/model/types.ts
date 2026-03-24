export type LlmProvider = "openai" | "anthropic" | "google" | "ollama" | "other";

export interface LlmModel {
    id: number;
    name: string;
    slug: string;
    provider: LlmProvider;
    description: string | null;
    isDefault: boolean;
    contextWindow: number;
}

export interface SummaryContentMeta {
    fileName?: string;
    subjectName?: string;
    [key: string]: unknown;
}

export interface SummaryContentJson {
    meta?: SummaryContentMeta;
    shortSummary?: string;
    mainPoints?: string[];
    keyTerms?: string[];
    possibleQuestions?: string[];
    [key: string]: unknown;
}

export interface SummaryListItem {
    id: number;
    title: string;
    createdAt: string;
    updatedAt?: string;
    contentJson?: SummaryContentJson | null;
}

export interface SummaryArtifact extends SummaryListItem {
    contentJson: SummaryContentJson | null;
}
