import { apiFetch } from "@/shared/api/http";
import type { PaginatedNotifications } from "../model/types";

export const notificationApi = {
    getNotifications: (page = 1) => {
        return apiFetch<PaginatedNotifications>(`/api/v1/notifications?page=${page}`);
    },

    markAsRead: (id: number) => {
        return apiFetch<{ message: string }>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
    },

    markAllAsRead: () => {
        return apiFetch<{ message: string }>(`/api/v1/notifications/read-all`, { method: "PATCH" });
    },

    deleteNotification: (id: number) => {
        return apiFetch<{ message: string }>(`/api/v1/notifications/${id}`, { method: "DELETE" });
    },
};
