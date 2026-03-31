export type TaskCategory = "study" | "personal" | "work";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface Task {
    id: number;
    title: string;
    description: string | null;
    category: TaskCategory;
    priority: TaskPriority;
    status: TaskStatus;
    dueAt: string | null;
    completedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface TaskPayload {
    title: string;
    description: string | null;
    category: TaskCategory;
    priority: TaskPriority;
    status: TaskStatus;
    dueAt: string | null;
}

export interface TaskFilters {
    search?: string;
    category?: TaskCategory | "";
    priority?: TaskPriority | "";
    status?: TaskStatus | "";
    dueState?: "today" | "upcoming" | "overdue" | "none" | "";
    sortBy?: "due_at" | "priority" | "created_at";
    sortDir?: "asc" | "desc";
}

export interface Note {
    id: number;
    title: string;
    bodyMarkdown: string;
    subjectId: number | null;
    taskIds: number[];
    isPinned: boolean;
    archivedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface NotePayload {
    title: string;
    bodyMarkdown: string;
    subjectId: number | null;
    taskIds: number[];
}

export interface NoteFilters {
    search?: string;
    subjectId?: number | null;
    archived?: boolean;
}
