/**
 * processes/ws-connection/index.ts
 *
 * WebSocket lifecycle manager.
 * Subscribes to authStore and connects / disconnects the WS client
 * based on the user's authentication state.
 *
 * Usage: call `initWsConnection()` once at app startup (before render) or
 * let WsProvider handle it reactively.
 */
import { wsClient } from "@/shared/realtime/ws-client";
import { authStore } from "@/entities/user/model/auth-store";
import { ENABLE_WS } from "@/app/config/feature-flags";

let _unsubscribe: (() => void) | null = null;

/**
 * Boot the WS connection manager.
 * Safe to call multiple times — second call is no-op.
 */
export function initWsConnection(): void {
    if (!ENABLE_WS || _unsubscribe) return;

    _unsubscribe = authStore.subscribe(() => {
        const { user, isReady } = authStore.getState();

        if (isReady && user && !wsClient.isConnected) {
            wsClient.connect();
        }

        if (isReady && !user && wsClient.isConnected) {
            wsClient.disconnect();
        }
    });
}

/**
 * Tear down the WS connection manager (for tests / hot-reload).
 */
export function destroyWsConnection(): void {
    _unsubscribe?.();
    _unsubscribe = null;
    wsClient.disconnect();
}
