const flag = (key: string, fallback = false): boolean => {
    const val = import.meta.env[key];
    if (val === undefined) return fallback;
    return val === "true" || val === "1";
};

export const ENABLE_AI = flag("VITE_ENABLE_AI", true);
export const ENABLE_GROUPS = flag("VITE_ENABLE_GROUPS", true);
export const ENABLE_CHAT = flag("VITE_ENABLE_CHAT", true);
export const ENABLE_WS = flag("VITE_ENABLE_WS", true);
export const ENABLE_REALTIME = flag("VITE_ENABLE_REALTIME", true);
