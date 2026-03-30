import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useSignIn } from "@/modules/auth/ui/sign-in/use-sign-in";
import { extractApiFieldErrors } from "@/shared/lib/forms/extract-api-field-errors";
import { useToast } from "@/shared/hooks/useToast";
import usePageTitle from "@/shared/hooks/usePageTitle";
import { LoginForm } from "@/modules/auth/ui/login-form";
import { AuthPageShell } from "@/modules/auth/ui/auth-page-shell";
import { fetchCsrfToken } from "@/shared/api/csrf";

type LoginLocationState = {
    from?: string;
};

export function LoginPage() {
    usePageTitle("Вхід");

    const nav = useNavigate();
    const loc = useLocation();
    const { mutateAsync, isPending } = useSignIn();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        void fetchCsrfToken().catch(() => undefined);
    }, []);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});

        try {
            await mutateAsync({ email, password });

            const from = (loc.state as LoginLocationState | null)?.from;
            nav(from ?? "/dashboard", { replace: true });
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
            <LoginForm
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={onSubmit}
                isPending={isPending}
                errors={errors}
            />
        </AuthPageShell>
    );
}
