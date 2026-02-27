import { WsClient } from "@/shared/realtime/ws-client";

/**
 * Centralized WS connection manager.
 *
 * Тут може жити логіка:
 * - підключення після логіну
 * - перепідключення
 * - оновлення токена
 * - heartbeats
 *
 * Зараз це тонкий фасад поверх `WsClient`, щоб зафіксувати архітектурне місце.
 */

let client: WsClient | null = null;

export function getWsClient(): WsClient | null {
    return client;
}

export function initWsConnection(baseUrl: string, getAuthParams?: () => Record<string, string | number | boolean | undefined>): WsClient {
    client = new WsClient({ baseUrl, getAuthParams });
    client.connect();
    return client;
}

export function disconnectWs(): void {
    client?.disconnect();
    client = null;
}

