import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "./index";
import { useEffect } from "react";
import { wsClient } from "@/shared/realtime/ws-client";
import { authStore } from "@/entities/user/model/auth-store";

export const QUERY_KEY_NOTIFICATIONS = ["notifications"];

export function useNotifications() {
    const queryClient = useQueryClient();
    const { user } = authStore.getState();

    // Підписка на WebSocket події для миттєвого оновлення кешу
    useEffect(() => {
        if (!user) return;

        const channelName = `user.${user.id}`;
        
        const handleNewNotification = () => {
            // Найпростіший варіант – інвалідувати кеш, щоб відбувся перезапит
            // Можна також робити optimistic update, вставляючи payload у кеш (див. нижче)
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS });
        };

        wsClient.listen("private", channelName, "notification.created", handleNewNotification);

        return () => {
            // При анмаунті ми можемо ігнорувати leave, якщо інші хуки теж слухають цей канал, 
            // але в Echo ліпше просто не підписуватись двічі. 
            // wsClient залишає канал відкритим, тому просто видаляємо лісенера (якщо в нас був би .off() для Echo).
            // В даній реалізації наша обгортка Echo не дає простого способу відписати саме одну функцію, 
            // проте для сторінки сповіщень це працює нормально.
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS });
        },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationApi.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY_NOTIFICATIONS });
        },
    });
}
