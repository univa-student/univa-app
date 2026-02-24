import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { fetchCsrfToken } from "@/shared/api/csrf";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/entities/user/model/auth-store";
import type { User } from "@/entities/user/model/types";

interface SignUpPayload {
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export function useSignUp() {
    return useMutation({
        mutationFn: async (body: SignUpPayload): Promise<User> => {
            await fetchCsrfToken();

            return apiFetch<User>(ENDPOINTS.auth.register, {
                method: "POST",
                body: JSON.stringify(body),
            });
        },
        onSuccess: (user) => {
            // Backend auto-logs in after register
            authStore.setUser(user);
        },
    });
}
