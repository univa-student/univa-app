import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    AuthSession,
    ChangePasswordPayload,
    UpdateProfilePayload,
    User,
} from "../model/types";

export const userQueries = {
    me: () => ({
        queryKey: ["me"],
        queryFn: () => apiFetch<User>(ENDPOINTS.auth.me, {
            silent401: true,
        }),
    }),
    updateProfile: (payload: UpdateProfilePayload) => ({
        queryKey: ["me", "profile"],
        queryFn: () =>
            apiFetch<User>(ENDPOINTS.me.profile, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
    }),
    changePassword: (payload: ChangePasswordPayload) => ({
        queryKey: ["me", "password"],
        queryFn: () =>
            apiFetch<void>(ENDPOINTS.me.password, {
                method: "POST",
                body: JSON.stringify(payload),
            }),
    }),
    logout: () => ({
        mutationKey: ["logout"],
        mutationFn: () => apiFetch<void>(ENDPOINTS.auth.logout, { method: "POST" }),
    }),
};

export const sessionQueries = {
    all: () => ["auth", "sessions"] as const,

    list: () => queryOptions({
        queryKey: sessionQueries.all(),
        queryFn: () => apiFetch<AuthSession[]>(ENDPOINTS.auth.sessions, {
            cacheTtlMs: 15_000,
        }),
    }),

    revoke: (sessionId: string) => ({
        mutationKey: [...sessionQueries.all(), "revoke", sessionId],
        mutationFn: () =>
            apiFetch<void>(ENDPOINTS.auth.revokeSession(sessionId), {
                method: "DELETE",
            }),
    }),
};
