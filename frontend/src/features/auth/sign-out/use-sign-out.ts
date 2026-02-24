import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { fetchCsrfToken } from "@/shared/api/csrf";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/entities/user/model/auth-store";
import { useNavigate } from "react-router-dom";

export function useSignOut() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
            await fetchCsrfToken();

            await apiFetch(ENDPOINTS.auth.logout, {
                method: "POST",
            });
        },
        onSuccess: () => {
            authStore.reset();
            navigate("/login", { replace: true });
        },
        onError: () => {
            // Even if logout fails, clear local state
            authStore.reset();
            navigate("/login", { replace: true });
        },
    });
}