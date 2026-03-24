import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { deadlineQueries } from "./queries";
import type { Deadline, CreateDeadlinePayload, UpdateDeadlinePayload } from "../model/types";

export function useDeadlines(filters?: Record<string, string | number | boolean | null | undefined>) {
    return useQuery(deadlineQueries.list(filters));
}

export function useDeadline(id: number) {
    return useQuery(deadlineQueries.detail(id));
}

export function useDeadlinesStats() {
    return useQuery(deadlineQueries.stats());
}

export function useCreateDeadline() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateDeadlinePayload) => {
            const res = await apiFetch<Deadline>(ENDPOINTS.deadlines.base, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return res;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: deadlineQueries.all() });
        },
    });
}

export function useUpdateDeadline() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateDeadlinePayload }) => {
            const res = await apiFetch<Deadline>(ENDPOINTS.deadlines.id(id), {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
            return res;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: deadlineQueries.all() });
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
            qc.invalidateQueries({ queryKey: deadlineQueries.all() });
        },
    });
}
