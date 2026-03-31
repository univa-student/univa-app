import { format } from "date-fns";
import type { Task, TaskStatus } from "../model/types";

export const taskStatusOrder: TaskStatus[] = ["todo", "in_progress", "done", "cancelled"];

export const taskStatusMeta: Record<TaskStatus, { label: string; accent: string }> = {
    todo: { label: "To-do", accent: "border-slate-300 bg-slate-50" },
    in_progress: { label: "В роботі", accent: "border-amber-300 bg-amber-50" },
    done: { label: "Готово", accent: "border-emerald-300 bg-emerald-50" },
    cancelled: { label: "Скасовано", accent: "border-zinc-300 bg-zinc-100" },
};

export const taskPriorityMeta = {
    low: { label: "Низький", className: "bg-zinc-100 text-zinc-700" },
    medium: { label: "Середній", className: "bg-blue-100 text-blue-700" },
    high: { label: "Високий", className: "bg-orange-100 text-orange-700" },
    critical: { label: "Критичний", className: "bg-red-100 text-red-700" },
} as const;

export function getNextTaskStatus(status: TaskStatus): TaskStatus | null {
    if (status === "todo") return "in_progress";
    if (status === "in_progress") return "done";
    return null;
}

export function isTaskOverdue(task: Task): boolean {
    if (!task.dueAt) return false;
    if (task.status === "done" || task.status === "cancelled") return false;
    return new Date(task.dueAt).getTime() < Date.now();
}

export function formatTaskDate(value: string | null | undefined): string {
    if (!value) return "Без дедлайну";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Без дедлайну";
    return format(date, "dd.MM HH:mm");
}

export function toDateTimeInputValue(value: string | null | undefined): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

export function toIsoFromDateTimeInput(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

export function stripMarkdown(value: string): string {
    return value
        .replace(/[#>*_`~\-]/g, " ")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}
