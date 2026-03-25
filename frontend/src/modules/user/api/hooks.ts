import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthUser } from "@/modules/auth/model/useAuthUser";
import { userChannel } from "@/shared/realtime/channels";
import { WS_EVENTS } from "@/shared/realtime/events";
import { wsClient } from "@/shared/realtime/ws-client";
import { friendQueries } from "./queries";

export function useFriends(enabled = true) {
    return useQuery({
        ...friendQueries.list(),
        enabled,
    });
}

export function usePendingFriendRequests(enabled = true) {
    return useQuery({
        ...friendQueries.pending(),
        enabled,
    });
}

export function useSearchFriendUsers(query: string, enabled = true) {
    return useQuery({
        ...friendQueries.search(query),
        enabled: enabled && query.trim().length >= 2,
        placeholderData: keepPreviousData,
    });
}

export function useFriendshipStatus(userId?: number | null) {
    return useQuery({
        ...friendQueries.status(userId!),
        enabled: Boolean(userId),
    });
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => friendQueries.send(userId).queryFn(),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["friends"] });
            void queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
    });
}

export function useAcceptFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => friendQueries.accept(userId).queryFn(),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["friends"] });
            void queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
    });
}

export function useRemoveFriend() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => friendQueries.remove(userId).queryFn(),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["friends"] });
            void queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
    });
}

export function useFriendsRealtime(enabled = true) {
    const user = useAuthUser();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled || !user) {
            return;
        }

        const channelName = userChannel(user.id);
        let invalidateTimer: number | null = null;

        const handleFriendshipUpdate = () => {
            if (invalidateTimer !== null) {
                return;
            }

            invalidateTimer = window.setTimeout(() => {
                invalidateTimer = null;
                void queryClient.invalidateQueries({ queryKey: ["friends"] });
            }, 300);
        };

        wsClient.listen("private", channelName, WS_EVENTS.FRIENDSHIP_UPDATED, handleFriendshipUpdate);

        return () => {
            if (invalidateTimer !== null) {
                window.clearTimeout(invalidateTimer);
            }

            wsClient.leave(channelName);
        };
    }, [enabled, queryClient, user]);
}
