import React, { useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/modules/auth/model/auth-store";
import type { User } from "@/modules/auth/model/types";
import { AuthContext } from "@/app/context/auth-context";
import { useSyncExternalStore } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const state = useSyncExternalStore(
        authStore.subscribe,
        authStore.getState,
        authStore.getState
    );

    const { user, isReady } = state;

    const setAuthenticatedUser = useCallback((nextUser: User | null) => {
        authStore.setUser(nextUser);
    }, []);

    const setReady = useCallback((value: boolean) => {
        authStore.setReady(value);
    }, []);

    const refetch = useCallback(async () => {
        try {
            const data = await apiFetch<User>(ENDPOINTS.auth.me, {
                silent401: true,
            });
            authStore.setUser(data);
        } catch {
            authStore.setUser(null);
        } finally {
            authStore.setReady(true);
        }
    }, []);

    useEffect(() => {
        if (!isReady) {
            refetch().then(() => {});
        }
    }, [isReady, refetch]);

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
