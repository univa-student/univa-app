/**
 * entities/task/model/types.ts
 *
 * Task (deadline) domain types.
 */

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueAt: string | null;  // ISO datetime
    subjectId: number | null;
    userId: number;
    createdAt: string;
    updatedAt: string;
}
