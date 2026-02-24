import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { authStore } from "@/entities/user/model/auth-store";
import type { User } from "@/entities/user/model/types";

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
    user: User | null;
    isReady: boolean;
    refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    isReady: false,
    refetch: async () => { },
});

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isReady, setIsReady] = useState(false);

    const fetchMe = useCallback(async () => {
        try {
            const data = await apiFetch<User>(ENDPOINTS.auth.me);
            setUser(data);
            authStore.setUser(data);
        } catch {
            setUser(null);
            authStore.setUser(null);
        } finally {
            setIsReady(true);
            authStore.setReady(true);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    // Sync with external store changes (e.g., after login/logout in features)
    useEffect(() => {
        return authStore.subscribe(() => {
            const s = authStore.getState();
            setUser(s.user);
            setIsReady(s.isReady);
        });
    }, []);

    const value = useMemo(
        () => ({ user, isReady, refetch: fetchMe }),
        [user, isReady, fetchMe],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
