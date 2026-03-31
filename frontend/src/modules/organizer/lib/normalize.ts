import type { Note, Task } from "../model/types";

function read<T>(value: unknown, ...keys: string[]): T | undefined {
    if (!value || typeof value !== "object") return undefined;
    const source = value as Record<string, unknown>;
    for (const key of keys) {
        if (source[key] !== undefined) {
            return source[key] as T;
        }
    }
    return undefined;
}

export function normalizeTask(raw: unknown): Task | null {
    if (!raw || typeof raw !== "object") return null;

    return {
        id: read<number>(raw, "id") ?? 0,
        title: read<string>(raw, "title") ?? "Задача",
        description: read<string | null>(raw, "description") ?? null,
        category: read<Task["category"]>(raw, "category") ?? "study",
        priority: read<Task["priority"]>(raw, "priority") ?? "medium",
        status: read<Task["status"]>(raw, "status") ?? "todo",
        dueAt: read<string | null>(raw, "dueAt", "due_at") ?? null,
        completedAt: read<string | null>(raw, "completedAt", "completed_at") ?? null,
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
        updatedAt: read<string | null>(raw, "updatedAt", "updated_at") ?? null,
    };
}

export function normalizeNote(raw: unknown): Note | null {
    if (!raw || typeof raw !== "object") return null;

    const taskIds = read<unknown[]>(raw, "taskIds", "task_ids") ?? [];

    return {
        id: read<number>(raw, "id") ?? 0,
        title: read<string>(raw, "title") ?? "Нотатка",
        bodyMarkdown: read<string>(raw, "bodyMarkdown", "body_markdown") ?? "",
        subjectId: read<number | null>(raw, "subjectId", "subject_id") ?? null,
        taskIds: taskIds
            .map((item) => Number(item))
            .filter((item) => Number.isFinite(item)),
        isPinned: read<boolean>(raw, "isPinned", "is_pinned") ?? false,
        archivedAt: read<string | null>(raw, "archivedAt", "archived_at") ?? null,
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
        updatedAt: read<string | null>(raw, "updatedAt", "updated_at") ?? null,
    };
}
