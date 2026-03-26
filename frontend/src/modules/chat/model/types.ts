/**
 * entities/message/model/types.ts
 *
 * Message domain types (for AI chats and group channels).
 */

export type MessageType = "text" | "image" | "file" | "system";
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
    id: number;
    group_channel_id: number | null;
    userId: number | null;    // null = AI/system message
    role: MessageRole;
    type: MessageType;
    content: string;
    fileId: number | null;
    createdAt: string;
    updatedAt: string;
}
