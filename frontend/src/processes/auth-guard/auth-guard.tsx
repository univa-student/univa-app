import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";

// ─── Loader (shown while checking auth) ──────────────────────────────────────

function AuthLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Завантаження…</p>
            </div>
        </div>
    );
}

// ─── Guard ────────────────────────────────────────────────────────────────────

/**
 * Protects routes that require authentication.
 *
 * - If auth check is in progress → shows loader
 * - If not authenticated → redirects to /login (preserving intended path)
 * - If authenticated → renders children
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isReady } = useAuth();
    const location = useLocation();

    if (!isReady) {
        return <AuthLoader />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
}