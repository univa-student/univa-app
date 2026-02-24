import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSignIn } from "../../features/auth/sign-in/use-sign-in";

export function LoginPage() {
    const nav = useNavigate();
    const loc = useLocation() as any;
    const { mutateAsync, isPending, error } = useSignIn();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") || "");
        const password = String(form.get("password") || "");

        await mutateAsync({ email, password });
        nav(loc.state?.from ?? "/dashboard", { replace: true });
    }

    return (
        <div style={{ maxWidth: 360, margin: "10vh auto", padding: 16 }}>
            <h1 style={{ marginBottom: 12 }}>Login</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                <input name="email" placeholder="Email" autoComplete="email" />
                <input name="password" placeholder="Password" type="password" autoComplete="current-password" />
                <button disabled={isPending} type="submit">
                    {isPending ? "Signing in…" : "Sign in"}
                </button>
            </form>

            {error ? (
                <p style={{ marginTop: 10, color: "crimson" }}>
                    Помилка входу. Перевір email/пароль.
                </p>
            ) : null}
        </div>
    );
}