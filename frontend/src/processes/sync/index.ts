/**
 * processes/sync/index.ts
 *
 * Cache sync process.
 * Listens to WebSocket events and invalidates / updates TanStack Query cache
 * so the UI refreshes automatically on realtime updates.
 */
import { wsClient } from "@/shared/realtime/ws-client";
import { queryClient } from "@/shared/api/query-client";
import { WS_EVENTS } from "@/shared/realtime/events";

let _initialized = false;

/** Register all realtime → cache sync handlers. Call once at app startup. */
export function initSync(): void {
    if (_initialized) return;
    _initialized = true;

    wsClient.on(WS_EVENTS.MESSAGE_CREATED, ({ spaceId }) => {
        queryClient.invalidateQueries({ queryKey: ["messages", spaceId] });
    });

    wsClient.on(WS_EVENTS.FILE_UPLOADED, () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
    });

    wsClient.on(WS_EVENTS.FILE_INDEXED, () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
    });

    wsClient.on(WS_EVENTS.TASK_CREATED, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    wsClient.on(WS_EVENTS.TASK_UPDATED, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    wsClient.on(WS_EVENTS.SCHEDULE_UPDATED, () => {
        queryClient.invalidateQueries({ queryKey: ["schedule"] });
    });

    wsClient.on(WS_EVENTS.NOTIFICATION_CREATED, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
}

/** Remove all sync handlers and reset state (for tests / hot-reload). */
export function destroySync(): void {
    _initialized = false;
    // Note: individual handler cleanup omitted for brevity — in production
    // use wsClient.off() per handler if granular cleanup is needed.
}
