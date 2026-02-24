import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "@/entities/user/model/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const isAuthed = authStore.getState().isAuthenticated;

    if (!isAuthed) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <>{children}</>;
}