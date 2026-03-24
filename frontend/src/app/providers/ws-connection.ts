import { wsClient } from "@/shared/realtime/ws-client";
import { authStore } from "@/modules/auth/model/auth-store";
import { ENABLE_WS } from "@/app/config/feature-flags";

let _unsubscribe: (() => void) | null = null;

// ─── core logic ──────────────────────────────────────────
function syncConnection() {
    const { user, isReady } = authStore.getState();

    if (!isReady) return;

    if (user && !wsClient.isConnected) {
        wsClient.connect();
        return;
    }

    if (!user && wsClient.isConnected) {
        wsClient.disconnect();
    }
}

// ─── init ────────────────────────────────────────────────
export function initWsConnection(): void {
    if (!ENABLE_WS || _unsubscribe) return;

    // initial sync
    syncConnection();

    // subscribe
    _unsubscribe = authStore.subscribe(syncConnection);
}

// ─── destroy ─────────────────────────────────────────────
export function destroyWsConnection(): void {
    _unsubscribe?.();
    _unsubscribe = null;

    if (wsClient.isConnected) {
        wsClient.disconnect();
    }
}