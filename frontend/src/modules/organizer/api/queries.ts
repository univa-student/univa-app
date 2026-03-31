import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { normalizeNote, normalizeTask } from "../lib/normalize";
import type { Note, NoteFilters, NotePayload, Task, TaskFilters, TaskPayload } from "../model/types";

function appendParam(params: URLSearchParams, key: string, value: string | number | boolean | null | undefined) {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
}

function buildTaskQuery(filters?: TaskFilters) {
    const params = new URLSearchParams();
    if (!filters) return "";

    appendParam(params, "search", filters.search);
    appendParam(params, "category", filters.category);
    appendParam(params, "priority", filters.priority);
    appendParam(params, "status", filters.status);
    appendParam(params, "due_state", filters.dueState);
    appendParam(params, "sort_by", filters.sortBy);
    appendParam(params, "sort_dir", filters.sortDir);

    const query = params.toString();
    return query ? `?${query}` : "";
}

function buildNotesQuery(filters?: NoteFilters) {
    const params = new URLSearchParams();
    if (!filters) return "";

    appendParam(params, "search", filters.search);
    appendParam(params, "subject_id", filters.subjectId ?? undefined);
    appendParam(params, "archived", filters.archived ? "1" : "0");

    const query = params.toString();
    return query ? `?${query}` : "";
}

function serializeTaskPayload(payload: TaskPayload) {
    return {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        status: payload.status,
        due_at: payload.dueAt,
    };
}

function serializeNotePayload(payload: NotePayload) {
    return {
        title: payload.title,
        body_markdown: payload.bodyMarkdown,
        subject_id: payload.subjectId,
        task_ids: payload.taskIds,
    };
}

export const organizerQueries = {
    all: () => ["organizer"] as const,
    tasks: () => [...organizerQueries.all(), "tasks"] as const,
    notes: () => [...organizerQueries.all(), "notes"] as const,
};

export const taskQueries = {
    list: (filters?: TaskFilters) => queryOptions({
        queryKey: [...organizerQueries.tasks(), filters],
        queryFn: async (): Promise<Task[]> => {
            const data = await apiFetch<unknown[]>(`${ENDPOINTS.organizer.tasks.base}${buildTaskQuery(filters)}`, {
                cacheTtlMs: 15_000,
            });

            return data
                .map((item) => normalizeTask(item))
                .filter((item): item is Task => item !== null);
        },
    }),
    detail: (id: number) => queryOptions({
        queryKey: [...organizerQueries.tasks(), "detail", id],
        queryFn: async (): Promise<Task | null> => {
            const data = await apiFetch<unknown>(ENDPOINTS.organizer.tasks.id(id));
            return normalizeTask(data);
        },
    }),
    create: (payload: TaskPayload) => ({
        mutationFn: () => apiFetch<unknown>(ENDPOINTS.organizer.tasks.base, {
            method: "POST",
            body: JSON.stringify(serializeTaskPayload(payload)),
        }),
    }),
    update: (id: number, payload: Partial<TaskPayload>) => ({
        mutationFn: () => apiFetch<unknown>(ENDPOINTS.organizer.tasks.id(id), {
            method: "PATCH",
            body: JSON.stringify(serializeTaskPayload({
                title: payload.title ?? "",
                description: payload.description ?? null,
                category: payload.category ?? "study",
                priority: payload.priority ?? "medium",
                status: payload.status ?? "todo",
                dueAt: payload.dueAt ?? null,
            })),
        }),
    }),
};

export const noteQueries = {
    list: (filters?: NoteFilters) => queryOptions({
        queryKey: [...organizerQueries.notes(), filters],
        queryFn: async (): Promise<Note[]> => {
            const data = await apiFetch<unknown[]>(`${ENDPOINTS.organizer.notes.base}${buildNotesQuery(filters)}`, {
                cacheTtlMs: 15_000,
            });

            return data
                .map((item) => normalizeNote(item))
                .filter((item): item is Note => item !== null);
        },
    }),
    detail: (id: number) => queryOptions({
        queryKey: [...organizerQueries.notes(), "detail", id],
        queryFn: async (): Promise<Note | null> => {
            const data = await apiFetch<unknown>(ENDPOINTS.organizer.notes.id(id));
            return normalizeNote(data);
        },
    }),
};

export function createTaskRequest(payload: TaskPayload) {
    return apiFetch<unknown>(ENDPOINTS.organizer.tasks.base, {
        method: "POST",
        body: JSON.stringify(serializeTaskPayload(payload)),
    });
}

export function updateTaskRequest(id: number, payload: Partial<TaskPayload>) {
    const requestPayload: Record<string, unknown> = {};

    if (payload.title !== undefined) requestPayload.title = payload.title;
    if (payload.description !== undefined) requestPayload.description = payload.description;
    if (payload.category !== undefined) requestPayload.category = payload.category;
    if (payload.priority !== undefined) requestPayload.priority = payload.priority;
    if (payload.status !== undefined) requestPayload.status = payload.status;
    if (payload.dueAt !== undefined) requestPayload.due_at = payload.dueAt;

    return apiFetch<unknown>(ENDPOINTS.organizer.tasks.id(id), {
        method: "PATCH",
        body: JSON.stringify(requestPayload),
    });
}

export function deleteTaskRequest(id: number) {
    return apiFetch<void>(ENDPOINTS.organizer.tasks.id(id), {
        method: "DELETE",
    });
}

export function createNoteRequest(payload: NotePayload) {
    return apiFetch<unknown>(ENDPOINTS.organizer.notes.base, {
        method: "POST",
        body: JSON.stringify(serializeNotePayload(payload)),
    });
}

export function updateNoteRequest(id: number, payload: Partial<NotePayload>) {
    const requestPayload: Record<string, unknown> = {};

    if (payload.title !== undefined) requestPayload.title = payload.title;
    if (payload.bodyMarkdown !== undefined) requestPayload.body_markdown = payload.bodyMarkdown;
    if (payload.subjectId !== undefined) requestPayload.subject_id = payload.subjectId;
    if (payload.taskIds !== undefined) requestPayload.task_ids = payload.taskIds;

    return apiFetch<unknown>(ENDPOINTS.organizer.notes.id(id), {
        method: "PATCH",
        body: JSON.stringify(requestPayload),
    });
}

export function setNotePinnedRequest(id: number, isPinned: boolean) {
    return apiFetch<unknown>(ENDPOINTS.organizer.notes.pin(id), {
        method: "PATCH",
        body: JSON.stringify({ is_pinned: isPinned }),
    });
}

export function setNoteArchivedRequest(id: number, archived: boolean) {
    return apiFetch<unknown>(ENDPOINTS.organizer.notes.archive(id), {
        method: "PATCH",
        body: JSON.stringify({ archived }),
    });
}

export function deleteNoteRequest(id: number) {
    return apiFetch<void>(ENDPOINTS.organizer.notes.id(id), {
        method: "DELETE",
    });
}
