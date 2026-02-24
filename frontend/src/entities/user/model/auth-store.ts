import { LS_KEY_AUTH_TOKEN } from "../../../shared/config/app.config";

type AuthState = {
    isAuthenticated: boolean;
    token: string | null;
    activeSpaceId: string | null;
    setToken: (t: string | null) => void;
    signOut: () => void;
};

const state: AuthState = {
    isAuthenticated: false,
    token: null,
    activeSpaceId: null,
    setToken: (t) => {
        state.token = t;
        state.isAuthenticated = Boolean(t);
        if (t) localStorage.setItem(LS_KEY_AUTH_TOKEN, t);
        else localStorage.removeItem(LS_KEY_AUTH_TOKEN);
    },
    signOut: () => {
        state.setToken(null);
        state.activeSpaceId = null;
    },
};

export const authStore = {
    getState: () => state,
};
