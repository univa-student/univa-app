import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../../../shared/api/http";
import { authStore } from "../../../entities/user/model/auth-store";

export function useSignIn() {
    return useMutation({
        mutationFn: async (body: { email: string; password: string }) => {
            // очікується, що Laravel повертає { token: "..." }
            return apiFetch<{ token: string }>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify(body),
            });
        },
        onSuccess: (data) => {
            authStore.getState().setToken(data.token);
        },
    });
}