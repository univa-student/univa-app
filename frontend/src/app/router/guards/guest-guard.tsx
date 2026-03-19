import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/context/auth-context";

// краще винести в shared/ui
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

export function GuestGuard({ children }: { children: React.ReactNode }) {
    const { user, isReady } = useAuth();
    const location = useLocation();

    if (!isReady) return <AuthLoader />;

    if (user) {
        return (
            <Navigate
                to="/dashboard"
                state={{ from: location.pathname + location.search }}
                replace
            />
        );
    }

    return <>{children}</>;
}