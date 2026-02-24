import { apiFetch } from "../../../shared/api/http";

export const userQueries = {
    me: () => ({
        queryKey: ["me"],
        queryFn: () => apiFetch<{ id: number; email: string }>("/api/me"),
    }),
};