import { wsClient } from "@/shared/realtime/ws-client";
import { queryClient } from "@/shared/api/query-client";
import { WS_EVENTS } from "@/shared/realtime/events";

let _initialized = false;
const unsubscribers: Array<() => void> = [];

// ─── mapping ─────────────────────────────────────────────
const EVENT_MAP: Record<string, (payload: any) => void> = {
    [WS_EVENTS.MESSAGE_CREATED]: ({ spaceId }) => {
        queryClient.invalidateQueries({queryKey: ["messages", spaceId]}).then(() => {});
    },

    [WS_EVENTS.FILE_UPLOADED]: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
    },

    [WS_EVENTS.FILE_INDEXED]: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
    },

    [WS_EVENTS.TASK_CREATED]: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },

    [WS_EVENTS.TASK_UPDATED]: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },

    [WS_EVENTS.SCHEDULE_UPDATED]: () => {
        queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },

    [WS_EVENTS.NOTIFICATION_CREATED]: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
};

// ─── init ────────────────────────────────────────────────
export function initSync(): void {
    if (_initialized) return;
    _initialized = true;

    Object.entries(EVENT_MAP).forEach(([event, handler]) => {
        wsClient.on(event, handler);
        unsubscribers.push(() => wsClient.off(event, handler));
    });
}

// ─── destroy ─────────────────────────────────────────────
export function destroySync(): void {
    unsubscribers.forEach((off) => off());
    unsubscribers.length = 0;
    _initialized = false;
}