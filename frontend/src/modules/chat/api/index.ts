/**
 * entities/message/api/index.ts
 *
 * Message API — load history and send messages.
 */
import { apiFetch } from "@/shared/api/http";
import type { Message } from "../model/types";

const API = "/api/v1";

export function loadHistory(groupId: number, channelId: number): Promise<Message[]> {
    return apiFetch<Message[]>(`${API}/groups/${groupId}/channels/${channelId}/messages`);
}

export function sendMessage(
    groupId: number,
    channelId: number,
    content: string,
    fileId?: number,
): Promise<Message> {
    return apiFetch<Message>(`${API}/groups/${groupId}/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content, file_id: fileId }),
    });
}

export function deleteMessage(groupId: number, channelId: number, messageId: number): Promise<void> {
    return apiFetch<void>(`${API}/groups/${groupId}/channels/${channelId}/messages/${messageId}`, {
        method: "DELETE",
    });
}
