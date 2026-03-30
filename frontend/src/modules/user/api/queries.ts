import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    FriendCard,
    FriendshipMutationResult,
    FriendshipStatus,
    PendingFriendRequest,
} from "../model/types";

export const friendQueries = {
    list: () => ({
        queryKey: ["friends", "list"] as const,
        queryFn: () =>
            apiFetch<FriendCard[]>(ENDPOINTS.friends.list, { cacheTtlMs: 0 }),
    }),
    pending: () => ({
        queryKey: ["friends", "pending"] as const,
        queryFn: () =>
            apiFetch<PendingFriendRequest[]>(ENDPOINTS.friends.pending, { cacheTtlMs: 0 }),
    }),
    search: (query: string) => ({
        queryKey: ["friends", "search", query] as const,
        queryFn: () =>
            apiFetch<FriendCard[]>(ENDPOINTS.friends.search(query), { cacheTtlMs: 0 }),
    }),
    status: (userId: number) => ({
        queryKey: ["friends", "status", userId] as const,
        queryFn: async () => {
            const data = await apiFetch<{ status: FriendshipStatus }>(
                ENDPOINTS.friends.status(userId),
                { cacheTtlMs: 30_000 }
            );

            return data.status;
        },
    }),
    send: (userId: number) => ({
        queryKey: ["friends", "send", userId] as const,
        queryFn: () =>
            apiFetch<FriendshipMutationResult>(ENDPOINTS.friends.send(userId), {
                method: "POST",
            }),
    }),
    accept: (userId: number) => ({
        queryKey: ["friends", "accept", userId] as const,
        queryFn: () =>
            apiFetch<FriendshipMutationResult>(ENDPOINTS.friends.accept(userId), {
                method: "PATCH",
            }),
    }),
    remove: (userId: number) => ({
        queryKey: ["friends", "remove", userId] as const,
        queryFn: () =>
            apiFetch<{ message: string }>(ENDPOINTS.friends.remove(userId), {
                method: "DELETE",
            }),
    }),
};
