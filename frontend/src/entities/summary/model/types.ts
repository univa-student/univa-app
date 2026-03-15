export interface SummaryMeta {
    fileId: number | null;
    fileName: string | null;
    subjectId: number | null;
    subjectName: string | null;
    language: string;
    mode: string;
    source: string;
}

export interface SummaryContentJson {
    title: string;
    shortSummary: string;
    mainPoints: string[];
    keyTerms: string[];
    possibleQuestions: string[];
    meta: SummaryMeta;
}

/** Full artifact returned by GET /summaries/:id */
export interface SummaryArtifact {
    id: number;
    userId: number;
    runId: number | null;
    type: string;
    title: string;
    contentJson: SummaryContentJson;
    contentText: string;
    summaryText: string;
    sourceContextType: string | null;
    sourceContextId: number | null;
    createdAt: string;
    updatedAt: string;
}

/** Lighter shape for list views (same fields, backend returns the same) */
export type SummaryListItem = SummaryArtifact;
