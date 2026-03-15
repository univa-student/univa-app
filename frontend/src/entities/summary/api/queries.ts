import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { SummaryArtifact, SummaryListItem } from "../model/types";

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
                apiFetch<SummaryArtifact>(ENDPOINTS.summaries.generate(fileId), {
                    method: "POST",
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
