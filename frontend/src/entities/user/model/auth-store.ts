import type { User } from "./types";

// ─── Simple reactive auth store ──────────────────────────────────────────────

type Listener = () => void;

interface AuthState {
    user: User | null;
    isReady: boolean;
}

let state: AuthState = {
    user: null,
    isReady: false,
};

const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((fn) => fn());
}

export const authStore = {
    getState: (): Readonly<AuthState> => state,

    setUser(user: User | null) {
        state = { ...state, user };
        notify();
    },

    setReady(isReady: boolean) {
        state = { ...state, isReady };
        notify();
    },

    reset() {
        state = { user: null, isReady: true };
        notify();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
