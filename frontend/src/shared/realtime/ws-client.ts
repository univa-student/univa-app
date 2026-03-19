/**
 * shared/realtime/ws-client.ts
 *
 * Laravel Echo WebSocket client integration.
 * Uses pusher-js under the hood for Laravel Reverb compatibility.
 * Supports private, presence and public channels.
 */
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { WS_HOST, WS_PORT, WS_KEY, WS_SCHEME } from "@/app/config/app.config";
import type { WsEventName, WsEventMap } from "./events";

// Required by laravel-echo
window.Pusher = Pusher;

class WsClient {
    private echo: Echo | null = null;
    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * Initializes Echo connection.
     *
     * For Sanctum cookie auth:
     * - user must already be authenticated
     * - /sanctum/csrf-cookie should be requested before login/auth flow
     * - withCredentials must be enabled
     *
     * Token is optional and can be used if backend broadcasting auth
     * is configured to accept Bearer tokens via auth:sanctum.
     */
    connect(token?: string): void {
        if (this.echo) return;

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

        this.echo = new Echo({
            broadcaster: "reverb",
            key: WS_KEY || "univa-app-key",
            wsHost: WS_HOST,
            wsPort: WS_PORT,
            wssPort: WS_PORT,
            forceTLS: WS_SCHEME === "https",
            enabledTransports: ["ws", "wss"],

            // Proxied by Vite to Laravel backend
            authEndpoint: "/broadcasting/auth",

            auth: {
                headers: authHeaders,
            },

            // Important for Sanctum session/cookie authentication
            withCredentials: true,
        });

        this._isConnected = true;
    }

    disconnect(): void {
        this.echo?.disconnect();
        this.echo = null;
        this._isConnected = false;
    }

    /**
     * Exposes Echo instance for advanced use cases.
     */
    get client(): Echo | null {
        return this.echo;
    }

    /**
     * Subscribe to a channel event.
     */
    listen<E extends WsEventName>(
        channelType: "private" | "presence" | "public",
        channelName: string,
        event: E,
        handler: (payload: WsEventMap[E]) => void
    ): void {
        if (!this.echo) return;

        const channel =
            channelType === "private"
                ? this.echo.private(channelName)
                : channelType === "presence"
                    ? this.echo.join(channelName)
                    : this.echo.channel(channelName);

        channel.listen(event, handler);
    }

    /**
     * Stop listening to a channel completely.
     */
    leave(channelName: string): void {
        this.echo?.leave(channelName);
    }
}

/** Singleton WebSocket client */
export const wsClient = new WsClient();