import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { fetchCsrfToken } from "@/shared/api/csrf";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/modules/auth/model/auth-store";
import type { User } from "@/modules/auth/model/types";
import { confirmAuthenticatedUser } from "@/modules/auth/api/confirm-authenticated-user";
import { userQueries } from "@/modules/auth/api/queries";

interface SignInPayload {
    email: string;
    password: string;
}

export function useSignIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: SignInPayload): Promise<User> => {
            await fetchCsrfToken();

            await apiFetch<User>(ENDPOINTS.auth.login, {
                method: "POST",
                body: JSON.stringify(body),
            });

            const confirmedUser = await confirmAuthenticatedUser();
            queryClient.setQueryData(userQueries.me().queryKey, confirmedUser);

            return confirmedUser;
        },
        onSuccess: (user) => {
            authStore.setUser(user);
        },
    });
}
