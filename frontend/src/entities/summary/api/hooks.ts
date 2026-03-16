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
            // Guard: if the backend didn't return an id, log and throw so we
            // don't navigate to /summaries/NaN
            if (!result || typeof result.id !== "number") {
                console.warn("[useGenerateSummary] unexpected response shape:", result);
                throw new Error("Summary generated but ID was missing in response");
            }
            return result;
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
