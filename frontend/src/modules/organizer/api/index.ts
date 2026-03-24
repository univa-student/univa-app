/**
 * entities/task/api/index.ts
 *
 * Task CRUD API — stubs ready for backend integration.
 */
import { apiFetch } from "@/shared/api/http";
import type { Task } from "../model/types";

const API = "/api/v1";

export function listTasks(): Promise<Task[]> {
    return apiFetch<Task[]>(`${API}/tasks`);
}

export function createTask(data: Partial<Task>): Promise<Task> {
    return apiFetch<Task>(`${API}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateTask(id: number, data: Partial<Task>): Promise<Task> {
    return apiFetch<Task>(`${API}/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function deleteTask(id: number): Promise<void> {
    return apiFetch<void>(`${API}/tasks/${id}`, { method: "DELETE" });
}
