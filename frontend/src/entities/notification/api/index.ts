/**
 * entities/notification/api/index.ts
 *
 * Notification API — list and mark as read.
 */
import { apiFetch } from "@/shared/api/http";
import type { Notification } from "../model/types";

const API = "/api/v1";

export function listNotifications(): Promise<Notification[]> {
    return apiFetch<Notification[]>(`${API}/notifications`);
}

export function markRead(id: number): Promise<void> {
    return apiFetch<void>(`${API}/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllRead(): Promise<void> {
    return apiFetch<void>(`${API}/notifications/read-all`, { method: "PATCH" });
}
