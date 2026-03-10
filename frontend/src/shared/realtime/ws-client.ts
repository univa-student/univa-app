/**
 * shared/realtime/ws-client.ts
 *
 * WebSocket client core.
 * Provides a thin, framework-agnostic wrapper around the browser's native
 * WebSocket API so it can be swapped for Laravel Echo / Pusher later.
 *
 * Usage:
 *   wsClient.connect();
 *   wsClient.on("message.created", (payload) => { ... });
 *   wsClient.off("message.created", handler);
 *   wsClient.disconnect();
 */
import { WS_HOST, WS_PORT } from "@/app/config/env";
import { WS_RECONNECT_DELAY_MS } from "@/app/config/constants";
import type { WsEventName, WsEventMap } from "./events";

type AnyHandler = (payload: unknown) => void;

class WsClient {
    private socket: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private handlers = new Map<string, Set<AnyHandler>>();
    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    connect(): void {
        if (this.socket) return; // already connected / connecting

        const url = `ws://${WS_HOST}:${WS_PORT}/app`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this._isConnected = true;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data as string) as {
                    event: string;
                    data: unknown;
                };
                this.dispatch(msg.event, msg.data);
            } catch {
                // ignore malformed frames
            }
        };

        this.socket.onclose = () => {
            this._isConnected = false;
            this.socket = null;
            // Auto-reconnect
            this.reconnectTimer = setTimeout(
                () => this.connect(),
                WS_RECONNECT_DELAY_MS,
            );
        };

        this.socket.onerror = () => {
            this.socket?.close();
        };
    }

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.socket?.close();
        this.socket = null;
        this._isConnected = false;
    }

    // ─── Event subscription ───────────────────────────────────────────────────

    on<E extends WsEventName>(event: E, handler: (payload: WsEventMap[E]) => void): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler as AnyHandler);
    }

    off<E extends WsEventName>(event: E, handler: (payload: WsEventMap[E]) => void): void {
        this.handlers.get(event)?.delete(handler as AnyHandler);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    private dispatch(event: string, payload: unknown): void {
        this.handlers.get(event)?.forEach((fn) => fn(payload));
    }
}

/** Singleton WebSocket client — one connection per app session. */
export const wsClient = new WsClient();
