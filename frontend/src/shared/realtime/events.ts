/**
 * shared/realtime/events.ts
 *
 * Typed event name constants and payload shapes for all WebSocket events.
 * Add new events here as the backend emits them.
 */

// ─── Event name constants ────────────────────────────────────────────────────

export const WS_EVENTS = {
    // Messages
    MESSAGE_CREATED: "message.created",
    MESSAGE_UPDATED: "message.updated",
    MESSAGE_DELETED: "message.deleted",

    // Files
    FILE_UPLOADED: "file.uploaded",
    FILE_INDEXED: "file.indexed",

    // Tasks
    TASK_CREATED: "task.created",
    TASK_UPDATED: "task.updated",

    // Schedule
    SCHEDULE_UPDATED: "schedule.updated",

    // Notifications
    NOTIFICATION_CREATED: "notification.created",
} as const;

export type WsEventName = typeof WS_EVENTS[keyof typeof WS_EVENTS];

// ─── Payload shapes ──────────────────────────────────────────────────────────

export interface WsEventMap {
    "message.created": { id: number; spaceId: number; content: string; userId: number };
    "message.updated": { id: number; content: string };
    "message.deleted": { id: number };
    "file.uploaded": { id: number; name: string };
    "file.indexed": { id: number };
    "task.created": { id: number };
    "task.updated": { id: number };
    "schedule.updated": { userId: number };
    "notification.created": { id: number; type: string; payload: unknown };
}
