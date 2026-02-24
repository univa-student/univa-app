// ─── Environment variables ───────────────────────────────────────────────────
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Univa";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const GOOGLE_FONTS_URL = import.meta.env.VITE_GOOGLE_FONTS_URL
    ?? "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

// ─── localStorage keys ──────────────────────────────────────────────────────
export const LS_KEY_AUTH_TOKEN = "univa_token";
export const LS_KEY_ERR_THEME = "univa_err_theme";

// ─── React Query defaults ────────────────────────────────────────────────────
export const QUERY_RETRY = 1;
export const QUERY_STALE_TIME = 30_000; // ms
