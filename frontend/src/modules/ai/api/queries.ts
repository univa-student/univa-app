import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { DailyDigestArtifact, GenerateStudySummaryPayload, SummaryArtifact, SummaryListItem } from "../model/types";

interface GenerateSummaryResponse {
    run: { id: number; [key: string]: unknown };
    artifact: SummaryArtifact;
}
export const summaryQueries = {
    list() {
        return {
            queryKey: ["summaries", "list"],
            queryFn: () => apiFetch<SummaryListItem[]>(ENDPOINTS.summaries.list),
        };
    },

    show(id: number) {
        return {
            queryKey: ["summaries", "detail", id],
            queryFn: () => apiFetch<SummaryArtifact>(ENDPOINTS.summaries.show(id)),
        };
    },

    generate(fileId: number) {
        return {
            queryKey: ["summaries", "generate", fileId],
            queryFn: () =>
                apiFetch<GenerateSummaryResponse>(ENDPOINTS.summaries.generate(fileId), {
                    method: "POST",
                }),
        };
    },

    generateStudy(payload: GenerateStudySummaryPayload) {
        return {
            queryKey: [
                "summaries",
                "generate-study",
                payload.fileIds.join("-"),
                payload.style ?? "standard",
                payload.includeFlashcards ? "flashcards" : "plain",
            ],
            queryFn: () =>
                apiFetch<GenerateSummaryResponse>(ENDPOINTS.summaries.create, {
                    method: "POST",
                    body: JSON.stringify({
                        file_ids: payload.fileIds,
                        style: payload.style ?? "standard",
                        include_flashcards: payload.includeFlashcards ?? false,
                        notes: payload.notes?.trim() ? payload.notes.trim() : undefined,
                    }),
                }),
        };
    },

    delete(id: number) {
        return {
            queryKey: ["summaries", "delete", id],
            queryFn: () =>
                apiFetch<void>(ENDPOINTS.summaries.delete(id), {
                    method: "DELETE",
                }),
        };
    },
};

export const dailyDigestQueries = {
    latest(date?: string) {
        return {
            queryKey: ["daily-digests", "latest", date ?? "current"],
            queryFn: () => apiFetch<DailyDigestArtifact | null>(ENDPOINTS.dailyDigests.latest(date), {
                cacheTtlMs: 60_000,
            }),
        };
    },
};
