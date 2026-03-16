import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { summaryQueries } from "./queries";

export function useSummaries() {
    return useQuery(summaryQueries.list());
}

export function useSummary(id: number) {
    return useQuery(summaryQueries.show(id));
}

/** Returns the first summary that was generated from the given file, or undefined */
export function useFileSummary(fileId: number) {
    const { data: summaries, ...rest } = useSummaries();
    const found = summaries?.find(
        (s) => s.sourceContextId === fileId && s.sourceContextType?.includes("File"),
    );
    return { data: found, ...rest };
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
            qc.invalidateQueries({ queryKey: ["summaries"] });
        },
    });
}

export function useDeleteSummary() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => summaryQueries.delete(id).queryFn(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["summaries"] });
        },
    });
}
