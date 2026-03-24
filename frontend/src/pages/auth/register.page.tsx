import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useSignUp } from "@/modules/auth/ui/sign-up/use-sign-up";
import { useToast } from "@/shared/hooks/useToast";
import { RegisterForm, type RegisterFormData } from "@/shared/shadcn/components/auth/register-form";
import { AuthPageShell } from "@/modules/auth/ui/auth-page-shell";
import { extractApiFieldErrors } from "@/shared/lib/forms/extract-api-field-errors";
import usePageTitle from "@/shared/hooks/usePageTitle.ts";

export function RegisterPage() {
    usePageTitle("Реєстрація");

    const nav = useNavigate();
    const { mutateAsync, isPending } = useSignUp();
    const { toast } = useToast();

    const [form, setForm] = useState<RegisterFormData>({
        last_name: "",
        first_name: "",
        middle_name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
        agree_terms: false,
        marketing_opt_in: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function onFieldChange<K extends keyof RegisterFormData>(
        field: K,
        value: RegisterFormData[K]
    ) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});

        try {
            await mutateAsync(form);
            nav("/dashboard", { replace: true });
        } catch (err) {
            const fieldErrors = extractApiFieldErrors(err);

            if (fieldErrors) {
                setErrors(fieldErrors);
                return;
            }

            toast({
                variant: "destructive",
                message: "Щось пішло не так. Спробуйте пізніше.",
            });
        }
    }

    return (
        <AuthPageShell>
            <RegisterForm
                form={form}
                onFieldChange={onFieldChange}
                onSubmit={onSubmit}
                isPending={isPending}
                errors={errors}
            />
        </AuthPageShell>
    );
}
