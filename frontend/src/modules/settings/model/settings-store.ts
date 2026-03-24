import type { UserSettings, UserSettingItem, SettingsState } from "./types";

type Listener = () => void;

let state: SettingsState = {
    ui: null,
    items: [],
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

    setAll(payload: { ui: UserSettings; items: UserSettingItem[] }) {
        state = { ...state, ui: payload.ui, items: payload.items, isReady: true };
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