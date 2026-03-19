import type { FileItem } from "@/entities/file/model/types";

export type DeadlineType =
    | "homework"
    | "lab"
    | "practice"
    | "essay"
    | "presentation"
    | "module"
    | "coursework"
    | "exam"
    | "credit"
    | "other";

export type DeadlinePriority = "low" | "medium" | "high" | "critical";

export type DeadlineStatus = "new" | "in_progress" | "completed" | "cancelled";

export interface Deadline {
    id: number;
    subjectId: number;
    title: string;
    description: string | null;
    type: DeadlineType;
    priority: DeadlinePriority;
    status: DeadlineStatus;
    dueAt: string; // ISO 8601 strings
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    files?: FileItem[];
}

export interface CreateDeadlinePayload extends Omit<Deadline, "id" | "createdAt" | "updatedAt" | "files"> {
    fileIds?: number[];
}
export type UpdateDeadlinePayload = Partial<CreateDeadlinePayload>;
