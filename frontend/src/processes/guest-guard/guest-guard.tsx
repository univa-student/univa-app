import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";

/**
 * Protects "guest-only" routes (login, register).
 *
 * - If auth check is in progress → shows loader
 * - If already authenticated → redirects to /dashboard
 * - If not authenticated → renders children
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { user, isReady } = useAuth();

    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Завантаження…</p>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
