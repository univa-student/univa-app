/**
 * entities/message/api/index.ts
 *
 * Message API — load history and send messages.
 */
import { apiFetch } from "@/shared/api/http";
import type { Message } from "../model/types";

const API = "/api/v1";

export function loadHistory(spaceId: number, page = 1): Promise<Message[]> {
    return apiFetch<Message[]>(`${API}/spaces/${spaceId}/messages?page=${page}`);
}

export function sendMessage(
    spaceId: number,
    content: string,
    fileId?: number,
): Promise<Message> {
    return apiFetch<Message>(`${API}/spaces/${spaceId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content, file_id: fileId }),
    });
}

export function deleteMessage(spaceId: number, messageId: number): Promise<void> {
    return apiFetch<void>(`${API}/spaces/${spaceId}/messages/${messageId}`, {
        method: "DELETE",
    });
}
