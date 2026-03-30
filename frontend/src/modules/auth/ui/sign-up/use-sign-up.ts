import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { fetchCsrfToken } from "@/shared/api/csrf";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/modules/auth/model/auth-store";
import type { User } from "@/modules/auth/model/types";
import type { RegisterFormData } from "@/modules/auth/ui/register-form";
import { confirmAuthenticatedUser } from "@/modules/auth/api/confirm-authenticated-user";
import { userQueries } from "@/modules/auth/api/queries";

function toFormData(form: RegisterFormData): FormData {
    const fd = new FormData();

    // Персональні
    fd.append("first_name", form.first_name);
    fd.append("last_name", form.last_name);
    if (form.middle_name) fd.append("middle_name", form.middle_name);

    // Акаунт
    fd.append("username", form.username);
    fd.append("email", form.email);

    // Безпека
    fd.append("password", form.password);
    fd.append("password_confirmation", form.password_confirmation);

    // Boolean -> "1"/"0"
    fd.append("agree_terms", form.agree_terms ? "1" : "0");
    fd.append("marketing_opt_in", form.marketing_opt_in ? "1" : "0");

    return fd;
}

export function useSignUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (form: RegisterFormData): Promise<User> => {
            await fetchCsrfToken();

            const fd = toFormData(form);

            await apiFetch<User>(ENDPOINTS.auth.register, {
                method: "POST",
                body: fd,
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
