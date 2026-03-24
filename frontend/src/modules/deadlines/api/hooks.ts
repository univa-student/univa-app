import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {apiFetch} from "@/shared/api/http";
import {ENDPOINTS} from "@/shared/api/endpoints";
import {deadlineQueries} from "./queries";
import type {CreateDeadlinePayload, Deadline, UpdateDeadlinePayload} from "../model/types";

export function useDeadlines(filters?: Record<string, string | number | boolean | null | undefined>) {
    return useQuery(deadlineQueries.list(filters));
}

export function useDeadlinesStats() {
    return useQuery(deadlineQueries.stats());
}

export function useCreateDeadline() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateDeadlinePayload) => {
            return await apiFetch<Deadline>(ENDPOINTS.deadlines.base, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: deadlineQueries.all() }).then(() => {});
        },
    });
}

export function useUpdateDeadline() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateDeadlinePayload }) => {
            return await apiFetch<Deadline>(ENDPOINTS.deadlines.id(id), {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: deadlineQueries.all() }).then(() => {});
        },
    });
}

export function useDeleteDeadline() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiFetch(ENDPOINTS.deadlines.id(id), { method: "DELETE" });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: deadlineQueries.all() }).then(() => {});
        },
    });
}
