import {queryOptions} from "@tanstack/react-query";
import {apiFetch} from "@/shared/api/http";
import {ENDPOINTS} from "@/shared/api/endpoints";
import type {Deadline} from "../model/types";

export const deadlineQueries = {
    all: () => ["deadlines"] as const,

    list: (filters?: Record<string, string | number | boolean | null | undefined>) => queryOptions({
        queryKey: [...deadlineQueries.all(), filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        params.append(key, String(value));
                    }
                });
            }
            return await apiFetch<Deadline[]>(`${ENDPOINTS.deadlines.base}?${params.toString()}`);
        },
    }),

    detail: (id: number) => queryOptions({
        queryKey: [...deadlineQueries.all(), "detail", id],
        queryFn: async () => {
            return await apiFetch<Deadline>(ENDPOINTS.deadlines.id(id));
        },
    }),

    stats: () => queryOptions({
        queryKey: [...deadlineQueries.all(), "stats"],
        queryFn: async () => {
            return await apiFetch<Record<string, number>>(ENDPOINTS.deadlines.stats);
        },
    }),
};
