import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    LessonInstance,
    ScheduleLesson,
    ExamEvent,
    LessonType,
    DeliveryMode,
    ExamType,
    RecurrenceRule,
    CreateLessonPayload,
    CreateExceptionPayload,
    CreateExamPayload,
    ScheduleException,
} from "../model/types";
import type { FileItem } from "@/modules/files/model/types";

// ─── Subject queries — re-exported from modules/subjects for backward compat ──
export { subjectQueries } from "@/modules/subjects/api/queries";

// ─── Schedule (built) ─────────────────────────────────────────────────────────

export const scheduleQueries = {
    built: (from: string, to: string) => ({
        queryKey: ["schedule", from, to],
        queryFn: () => apiFetch<LessonInstance[]>(ENDPOINTS.schedule(from, to), {
            cacheTtlMs: 60_000,
        }),
        staleTime: 1000 * 60 * 2, // 2 min
    }),
};

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const lessonQueries = {
    show: (id: number) => ({
        queryKey: ["schedule", "lesson", id],
        queryFn: () => apiFetch<ScheduleLesson>(ENDPOINTS.lessons.show(id), {
            cacheTtlMs: 60_000,
        }),
        staleTime: 1000 * 60 * 5,
    }),
    materials: (id: number) => ({
        queryKey: ["schedule", "lesson", id, "materials"],
        queryFn: () => apiFetch<FileItem[]>(ENDPOINTS.lessons.materials(id), {
            cacheTtlMs: 60_000,
        }),
        staleTime: 1000 * 60 * 5,
    }),
    create: (payload: CreateLessonPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<unknown>(ENDPOINTS.lessons.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (id: number, payload: Partial<CreateLessonPayload>) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<unknown>(ENDPOINTS.lessons.update(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    delete: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.lessons.delete(id), { method: "DELETE" }),
    }),
    createException: (lessonId: number, payload: CreateExceptionPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<ScheduleException>(
            ENDPOINTS.lessons.createException(lessonId),
            { method: "POST", body: JSON.stringify(payload) }
        ),
    }),
    deleteException: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.lessons.deleteException(id), { method: "DELETE" }),
    }),
};

// ─── Exams ────────────────────────────────────────────────────────────────────

export const examQueries = {
    list: (from: string, to: string) => ({
        queryKey: ["exams", from, to],
        queryFn: () => apiFetch<ExamEvent[]>(ENDPOINTS.exams.list(from, to), {
            cacheTtlMs: 60_000,
        }),
    }),
    create: (payload: CreateExamPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<ExamEvent>(ENDPOINTS.exams.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (id: number, payload: Partial<CreateExamPayload>) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<ExamEvent>(ENDPOINTS.exams.update(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    delete: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.exams.delete(id), { method: "DELETE" }),
    }),
};

// ─── Dictionaries ─────────────────────────────────────────────────────────────

export const dictionaryQueries = {
    lessonTypes: () => ({
        queryKey: ["dict", "lesson-types"],
        queryFn: () => apiFetch<LessonType[]>(ENDPOINTS.dictionaries.lessonTypes, {
            cacheTtlMs: 60 * 60 * 1000,
        }),
        staleTime: Infinity,
    }),
    deliveryModes: () => ({
        queryKey: ["dict", "delivery-modes"],
        queryFn: () => apiFetch<DeliveryMode[]>(ENDPOINTS.dictionaries.deliveryModes, {
            cacheTtlMs: 60 * 60 * 1000,
        }),
        staleTime: Infinity,
    }),
    examTypes: () => ({
        queryKey: ["dict", "exam-types"],
        queryFn: () => apiFetch<ExamType[]>(ENDPOINTS.dictionaries.examTypes, {
            cacheTtlMs: 60 * 60 * 1000,
        }),
        staleTime: Infinity,
    }),
    recurrenceRules: () => ({
        queryKey: ["dict", "recurrence-rules"],
        queryFn: () => apiFetch<RecurrenceRule[]>(ENDPOINTS.dictionaries.recurrenceRules, {
            cacheTtlMs: 60 * 60 * 1000,
        }),
        staleTime: Infinity,
    }),
};
