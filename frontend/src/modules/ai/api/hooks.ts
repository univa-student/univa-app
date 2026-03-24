import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { summaryQueries } from "./queries";

export function useSummaries() {
    return useQuery(summaryQueries.list());
}

export function useSummary(id: number) {
    return useQuery(summaryQueries.show(id));
}

export function useGenerateSummary() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (fileId: number) => {
            const result = await summaryQueries.generate(fileId).queryFn();
            const summaryId = result?.artifact?.id;
            if (typeof summaryId !== "number") {
                console.warn("[useGenerateSummary] unexpected response:", result);
                throw new Error("Summary generated but ID was missing in response");
            }
            return result.artifact; // повертаємо SummaryArtifact
        },
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ["summaries"]}).then(() => {});
        },
    });
}

export function useDeleteSummary() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => summaryQueries.delete(id).queryFn(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["summaries"] }).then(() => {});
        },
    });
}
