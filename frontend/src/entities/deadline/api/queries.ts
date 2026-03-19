import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Deadline } from "../model/types";

export const deadlineQueries = {
    all: () => ["deadlines"] as const,

    list: (filters?: Record<string, any>) => queryOptions({
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
            const res = await apiFetch<Deadline[]>(`${ENDPOINTS.deadlines.base}?${params.toString()}`);
            return res;
        },
    }),

    detail: (id: number) => queryOptions({
        queryKey: [...deadlineQueries.all(), "detail", id],
        queryFn: async () => {
            const res = await apiFetch<Deadline>(ENDPOINTS.deadlines.id(id));
            return res;
        },
    }),

    stats: () => queryOptions({
        queryKey: [...deadlineQueries.all(), "stats"],
        queryFn: async () => {
            const res = await apiFetch<Record<string, number>>(ENDPOINTS.deadlines.stats);
            return res;
        },
    }),
};
