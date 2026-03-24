import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { User, UpdateProfilePayload, ChangePasswordPayload } from "../model/types";

export const userQueries = {
    me: () => ({
        queryKey: ["me"],
        queryFn: () => apiFetch<User>(ENDPOINTS.auth.me),
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
