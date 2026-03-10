/**
 * app/config/app.config.ts — SINGLE SOURCE OF TRUTH for all config.
 * Import from here everywhere; do NOT read import.meta.env directly.
 */

// ─── App identity ─────────────────────────────────────────────────────────────
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Univa";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.0.0";
export const APP_ENV = import.meta.env.MODE as "development" | "production" | "staging";
export const IS_DEV = import.meta.env.DEV as boolean;

// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// ─── WebSocket ────────────────────────────────────────────────────────────────
export const WS_HOST = import.meta.env.VITE_WS_HOST ?? "localhost";
export const WS_PORT = Number(import.meta.env.VITE_WS_PORT ?? 6001);
export const WS_KEY = import.meta.env.VITE_WS_KEY ?? "";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
export const GOOGLE_FONTS_URL =
    import.meta.env.VITE_GOOGLE_FONTS_URL ??
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

// ─── React Query ──────────────────────────────────────────────────────────────
export const QUERY_RETRY = 1;
export const QUERY_STALE_MS = 30_000;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE_DEFAULT = 20;

// ─── WebSocket internals ──────────────────────────────────────────────────────
export const WS_RECONNECT_DELAY_MS = 3_000;
export const WS_HEARTBEAT_MS = 30_000;

// ─── Local-storage keys ───────────────────────────────────────────────────────
export const LS_THEME_KEY = "univa_theme";
export const LS_KEY_ERR_THEME = "univa_err_theme";
export const LS_DEV_BAR_CLOSED = "univa_dev_bar_closed";

// ─── Logo ─────────────────────────────────────────────────────────────────────
import logoConfig from "@/app/config/logo.config";
export { logoConfig };
