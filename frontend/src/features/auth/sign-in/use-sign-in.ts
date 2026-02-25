import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { fetchCsrfToken } from "@/shared/api/csrf";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/entities/user/model/auth-store";
import type { User } from "@/entities/user/model/types";

interface SignInPayload {
    email: string;
    password: string;
}

export function useSignIn() {
    return useMutation({
        mutationFn: async (body: SignInPayload): Promise<User> => {
            await fetchCsrfToken();

            return apiFetch<User>(ENDPOINTS.auth.login, {
                method: "POST",
                body: JSON.stringify(body),
            });
        },
        onSuccess: (user) => {
            authStore.setUser(user);
        },
    });
}