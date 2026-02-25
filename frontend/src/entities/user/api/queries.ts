import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { User } from "../model/types";

export const userQueries = {
    me: () => ({
        queryKey: ["me"],
        queryFn: () => apiFetch<User>(ENDPOINTS.auth.me),
    }),
};