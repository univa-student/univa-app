/**
 * Typed WS events used across the app.
 *
 * Відповідає секції "Події" в README.
 * Це централізований перелік типів подій для realtime.
 */

export type RealtimeEventType =
    | "message.created"
    | "message.updated"
    | "message.deleted"
    | "file.uploaded"
    | "file.indexed"
    | "task.created"
    | "task.updated"
    | "schedule.updated"
    | "notification.created";

export interface RealtimeEvent<TPayload = unknown> {
    type: RealtimeEventType;
    payload: TPayload;
}

