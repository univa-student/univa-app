/**
 * shared/realtime/ws-client.ts
 *
 * Laravel Echo WebSocket client integration.
 * Uses pusher-js under the hood for Laravel Reverb compatibility.
 * Supports private, presence and public channels.
 */
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { API_BASE_URL, WS_HOST, WS_KEY, WS_PORT, WS_SCHEME } from "@/app/config/app.config";
import type { WsEventName, WsEventMap } from "./events";

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

class WsClient {
    private echo: Echo<"reverb"> | null = null;
    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    connect(token?: string): void {
        if (this.echo) {
            return;
        }

        const authHeaders: Record<string, string> = {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
        };

        if (token) {
            authHeaders.Authorization = `Bearer ${token}`;
        }

        const xsrfMatch = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        if (xsrfMatch) {
            authHeaders["X-XSRF-TOKEN"] = decodeURIComponent(xsrfMatch[1]);
        }

        const effectiveWsHost =
            WS_HOST !== "localhost" && WS_HOST !== "127.0.0.1"
                ? WS_HOST
                : window.location.hostname;

        const isTls = WS_SCHEME === "https" || window.location.protocol === "https:";
        const authEndpoint = API_BASE_URL
            ? `${API_BASE_URL}/broadcasting/auth`
            : `${window.location.origin}/broadcasting/auth`;

        this.echo = new Echo({
            broadcaster: "reverb",
            key: WS_KEY || "univa-app-key",
            wsHost: effectiveWsHost,
            wsPort: isTls ? 443 : WS_PORT,
            wssPort: isTls ? 443 : WS_PORT,
            forceTLS: isTls,
            enabledTransports: ["ws", "wss"],
            disableStats: true,
            authEndpoint,
            auth: {
                headers: authHeaders,
            },
            withCredentials: true,
        });

        const pusher = this.echo.connector?.pusher;

        if (pusher) {
            pusher.connection.bind("connected", () => {
                this._isConnected = true;
            });
            pusher.connection.bind("disconnected", () => {
                this._isConnected = false;
            });
            pusher.connection.bind("failed", () => {
                this._isConnected = false;
            });
        } else {
            this._isConnected = true;
        }
    }

    disconnect(): void {
        this.echo?.disconnect();
        this.echo = null;
        this._isConnected = false;
    }

    get client(): Echo<"reverb"> | null {
        return this.echo;
    }

    listen<E extends WsEventName>(
        channelType: "private" | "presence" | "public",
        channelName: string,
        event: E,
        handler: (payload: WsEventMap[E]) => void
    ): void {
        if (!this.echo) {
            return;
        }

        const channel =
            channelType === "private"
                ? this.echo.private(channelName)
                : channelType === "presence"
                    ? this.echo.join(channelName)
                    : this.echo.channel(channelName);

        // Laravel Echo requires a leading dot for broadcastAs() events.
        const echoEventName = this.normalizeEventName(event);

        channel.listen(echoEventName, handler);
    }

    leave(channelName: string): void {
        this.echo?.leave(channelName);
    }

    on<E extends WsEventName>(eventName: string, handler: (payload: WsEventMap[E]) => void): void {
        console.warn(`wsClient.on() called for ${eventName} but global bindings are not implemented yet.`);
        void handler;
    }

    off<E extends WsEventName>(eventName: string, handler: (payload: WsEventMap[E]) => void): void {
        void eventName;
        void handler;
    }

    private normalizeEventName(event: string): string {
        if (event.startsWith(".")) {
            return event;
        }

        return event.includes(".") ? `.${event}` : event;
    }
}

export const wsClient = new WsClient();
