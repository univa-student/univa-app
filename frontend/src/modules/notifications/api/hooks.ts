import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "./index";
import { useEffect } from "react";
import { WS_EVENTS } from "@/shared/realtime/events";
import { wsClient } from "@/shared/realtime/ws-client";
import { authStore } from "@/modules/auth/model/auth-store";

export const QUERY_KEY_NOTIFICATIONS = ["notifications"];

export function useNotifications() {
    const queryClient = useQueryClient();
    const { user } = authStore.getState();

    // Підписка на WebSocket події для миттєвого оновлення кешу
    useEffect(() => {
        if (!user) return;

        const channelName = `user.${user.id}`;
        let invalidateTimer: number | null = null;

        const handleNewNotification = () => {
            if (invalidateTimer !== null) {
                return;
            }

            invalidateTimer = window.setTimeout(() => {
                invalidateTimer = null;
                queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS }).then(() => {});
            }, 750);
        };

        wsClient.listen("private", channelName, WS_EVENTS.NOTIFICATION_CREATED, handleNewNotification);

        return () => {
            if (invalidateTimer !== null) {
                window.clearTimeout(invalidateTimer);
            }
            wsClient.leave(channelName);
        };
    }, [user, queryClient]);

    return useInfiniteQuery({
        queryKey: QUERY_KEY_NOTIFICATIONS,
        queryFn: ({ pageParam = 1 }) => notificationApi.getNotifications(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.current_page < lastPage.meta.last_page) {
                return lastPage.meta.current_page + 1;
            }
            return undefined;
        },
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS }).then(() => {});
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS }).then(() => {});
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS }).then(() => {});
        },
    });
}
