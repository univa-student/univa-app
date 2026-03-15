import { createContext, useContext } from "react";
import type { User } from "@/entities/user/model/types";

export interface AuthContextValue {
    user: User | null;
    isReady: boolean;
    refetch: () => Promise<void>;
    setAuthenticatedUser: (user: User | null) => void;
    setReady: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    isReady: false,
    refetch: async () => {},
    setAuthenticatedUser: () => {},
    setReady: () => {},
});

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
