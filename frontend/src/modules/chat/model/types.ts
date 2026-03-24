/**
 * entities/message/model/types.ts
 *
 * Message domain types (for AI chats and space chats).
 */

export type MessageType = "text" | "image" | "file" | "system";
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
    id: number;
    spaceId: number | null;    // null = personal AI chat
    userId: number | null;    // null = AI/system message
    role: MessageRole;
    type: MessageType;
    content: string;
    fileId: number | null;
    createdAt: string;
    updatedAt: string;
}
