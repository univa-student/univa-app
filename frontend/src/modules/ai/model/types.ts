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
    sourceContextType?: string | null;
    sourceContextId?: number | null;
    createdAt: string;
    updatedAt?: string;
    contentJson?: SummaryContentJson | null;
}

export interface SummaryArtifact extends SummaryListItem {
    contentJson: SummaryContentJson | null;
}

export interface DailyDigestLessonItem {
    subject?: string | null;
    time?: string | null;
    note?: string | null;
}

export interface DailyDigestDeadlineItem {
    title?: string | null;
    dueAt?: string | null;
    priority?: string | null;
}

export interface DailyDigestContentMeta {
    generatedForDate?: string;
    userName?: string;
    stats?: Record<string, number>;
    storage?: {
        used?: number;
        limit?: number;
        usedPercent?: number;
    };
    [key: string]: unknown;
}

export interface DailyDigestContentJson {
    title?: string;
    overview?: string;
    focus?: string | null;
    alerts?: string[];
    lessons?: DailyDigestLessonItem[];
    deadlines?: DailyDigestDeadlineItem[];
    actionItems?: string[];
    meta?: DailyDigestContentMeta;
    [key: string]: unknown;
}

export interface DailyDigestArtifact {
    id: number;
    type: "daily_digest";
    title: string | null;
    contentJson: DailyDigestContentJson | null;
    contentText: string | null;
    summaryText?: string | null;
    createdAt: string;
    updatedAt?: string;
}
