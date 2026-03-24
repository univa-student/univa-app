import type React from "react";

export type NotificationMeta = {
    title: string;
    icon: React.ElementType;
    badgeClass: string;
    iconClass: string;
    dotClass: string;
};

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
