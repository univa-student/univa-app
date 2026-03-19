import { createContext, useContext } from "react";
import type { User } from "@/modules/auth/model/types";

export interface AuthContextValue {
    user: User | null;
    isReady: boolean;
    refetch: () => Promise<void>;
    setAuthenticatedUser: (user: User | null) => void;
    setReady: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return ctx;
}