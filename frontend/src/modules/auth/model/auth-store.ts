import type { User } from "./types";

// ─── Simple reactive auth store ──────────────────────────────────────────────

type Listener = () => void;

interface AuthState {
    user: User | null;
    isReady: boolean;
}

const LS_USER_KEY = "univa:auth:user:v1";

function loadCachedUser(): User | null {
    try {
        const raw = localStorage.getItem(LS_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const cachedUser = loadCachedUser();

let state: AuthState = {
    user: cachedUser,
    isReady: !!cachedUser, // If we have a cached user, we are instantly ready
};

const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((fn) => fn());
}

export const authStore = {
    getState: (): Readonly<AuthState> => state,

    setUser(user: User | null) {
        state = { ...state, user };
        try {
            if (user) localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
            else localStorage.removeItem(LS_USER_KEY);
        } catch { /* empty */ } // ignore
        notify();
    },

    setReady(isReady: boolean) {
        state = { ...state, isReady };
        notify();
    },

    reset() {
        state = { user: null, isReady: true };
        try { localStorage.removeItem(LS_USER_KEY); } catch { /* ignore storage errors */ }
        notify();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
