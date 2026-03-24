export type NotificationFilter = "all" | "unread" | "ai" | "files" | "profile" | "avatar";

export type NotificationItem = {
    id: number;
    type: string;
    payload?: { message?: string };
    created_at?: string;
    createdAt?: string;
    read_at?: string | null;
    readAt?: string | null;
};
