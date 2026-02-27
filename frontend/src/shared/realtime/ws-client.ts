type EventHandler = (event: MessageEvent) => void;

interface WsClientOptions {
    /** Base WS URL, e.g. wss://example.com or ws://localhost:6001 */
    baseUrl: string;
    /** Optional: auth token or any static params for handshake */
    getAuthParams?: () => Record<string, string | number | boolean | undefined>;
}

/**
 * Minimal WebSocket client abstraction.
 *
 * Архітектурно відповідає `shared/realtime/ws-client.ts` з README:
 * один конекшн, можливість реконекту та підписки на події.
 *
 * Реальна інтеграція з Laravel Echo / Pusher / Socket.io
 * може бути додана поверх цього інтерфейсу.
 */
export class WsClient {
    private socket: WebSocket | null = null;
    private readonly options: WsClientOptions;
    private readonly handlers = new Set<EventHandler>();

    constructor(options: WsClientOptions) {
        this.options = options;
    }

    get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    connect(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

        const url = this.buildUrl();
        this.socket = new WebSocket(url);

        this.socket.onmessage = (event) => {
            this.handlers.forEach((handler) => handler(event));
        };

        // Для простоти тут немає складного reconnection.
        // Це можна додати в `processes/ws-connection`.
    }

    disconnect(): void {
        if (!this.socket) return;
        this.socket.close();
        this.socket = null;
    }

    subscribe(handler: EventHandler): () => void {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    send(data: unknown): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify(data));
    }

    private buildUrl(): string {
        const url = new URL(this.options.baseUrl);
        const params = this.options.getAuthParams?.() ?? {};

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined) return;
            url.searchParams.set(key, String(value));
        });

        return url.toString();
    }
}

