import React, { useCallback, useMemo } from "react";
import { authStore } from "@/modules/auth/model/auth-store";
import { userQueries } from "@/modules/auth/api/queries";
import type { User } from "@/modules/auth/model/types";
import { AuthContext } from "@/app/context/auth-context";
import { useSyncExternalStore } from "react";
import { queryClient } from "@/shared/api/query-client";

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
            const data = await queryClient.fetchQuery(userQueries.me());
            authStore.setUser(data);
        } catch {
            authStore.setUser(null);
        } finally {
            authStore.setReady(true);
        }
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
