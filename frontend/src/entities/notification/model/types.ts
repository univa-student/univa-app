/**
 * entities/notification/model/types.ts
 *
 * Notification domain types.
 */

export type NotificationType =
    | "task.due"
    | "message.created"
    | "schedule.updated"
    | "file.indexed"
    | "system";

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    body: string;
    payload: Record<string, unknown>;
    readAt: string | null;  // null = unread
    createdAt: string;
}
