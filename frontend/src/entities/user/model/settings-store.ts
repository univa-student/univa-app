export type UserSettings = {
    theme: "light" | "dark" | "system";
    language: "uk" | "en" | "pl" | "auto";
    compact: boolean;
    animations: boolean;
};

type Listener = () => void;

interface SettingsState {
    settings: UserSettings | null;
    isReady: boolean;
}

let state: SettingsState = {
    settings: null,
    isReady: false,
};

const listeners = new Set<Listener>();

function notify() {
    listeners.forEach((fn) => fn());
}

export const userSettingsStore = {
    getState(): Readonly<SettingsState> {
        return state;
    },

    setSettings(settings: UserSettings) {
        state = { ...state, settings, isReady: true };
        notify();
    },

    setReady(isReady: boolean) {
        state = { ...state, isReady };
        notify();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

