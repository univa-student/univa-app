import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/entities/user/model/auth-store";
import type { User } from "@/entities/user/model/types";
import { AuthContext } from "@/app/context/auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => authStore.getState().user);
    const [isReady, setIsReadyState] = useState<boolean>(() => authStore.getState().isReady);

    const setAuthenticatedUser = useCallback((nextUser: User | null) => {
        setUser(nextUser);
        authStore.setUser(nextUser);
    }, []);

    const setReady = useCallback((value: boolean) => {
        setIsReadyState(value);
        authStore.setReady(value);
    }, []);

    const refetch = useCallback(async () => {
        try {
            const data = await apiFetch<User>(ENDPOINTS.auth.me, {
                silent401: true,
            });
            setAuthenticatedUser(data);
        } catch {
            setAuthenticatedUser(null);
        } finally {
            setReady(true);
        }
    }, [setAuthenticatedUser, setReady]);

    useEffect(() => {
        return authStore.subscribe(() => {
            const s = authStore.getState();
            setUser(s.user);
            setIsReadyState(s.isReady);
        });
    }, []);

    const value = useMemo(
        () => ({
            user,
            isReady,
            refetch,
            setAuthenticatedUser,
            setReady,
        }),
        [user, isReady, refetch, setAuthenticatedUser, setReady],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
