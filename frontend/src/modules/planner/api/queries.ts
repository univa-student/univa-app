import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    PlannerBlock,
    PlannerBlockPayload,
    PlannerDayView,
    PlannerMutationResult,
    PlannerStatusPayload,
    PlannerSuggestion,
    PlannerSuggestionsPayload,
    PlannerWeekView,
} from "../model/types";

function unwrapMutationResult<T>(raw: T | { data: T; meta?: Record<string, unknown> }): PlannerMutationResult<T> {
    if (raw && typeof raw === "object" && "data" in raw) {
        return raw as PlannerMutationResult<T>;
    }

    return { data: raw as T };
}

export const plannerQueries = {
    all: () => ["planner"] as const,
    day: (date: string) => queryOptions({
        queryKey: [...plannerQueries.all(), "day", date],
        queryFn: () => apiFetch<PlannerDayView>(ENDPOINTS.planner.day(date)),
    }),
    week: (date: string) => queryOptions({
        queryKey: [...plannerQueries.all(), "week", date],
        queryFn: () => apiFetch<PlannerWeekView>(ENDPOINTS.planner.week(date)),
    }),
    blocks: (startAt: string, endAt: string) => queryOptions({
        queryKey: [...plannerQueries.all(), "blocks", startAt, endAt],
        queryFn: () => apiFetch<PlannerBlock[]>(ENDPOINTS.planner.blocks(startAt, endAt)),
    }),
    create: (payload: PlannerBlockPayload) =>
        apiFetch<PlannerBlock | { data: PlannerBlock; meta?: Record<string, unknown> }>(ENDPOINTS.planner.base, {
            method: "POST",
            body: JSON.stringify(payload),
        }).then(unwrapMutationResult),
    update: (id: number, payload: Partial<PlannerBlockPayload>) =>
        apiFetch<PlannerBlock | { data: PlannerBlock; meta?: Record<string, unknown> }>(ENDPOINTS.planner.block(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }).then(unwrapMutationResult),
    remove: (id: number) =>
        apiFetch<void>(ENDPOINTS.planner.block(id), {
            method: "DELETE",
        }),
    status: (id: number, payload: PlannerStatusPayload) =>
        apiFetch<PlannerBlock>(ENDPOINTS.planner.status(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    move: (id: number, payload: Pick<PlannerBlockPayload, "startAt" | "endAt" | "allowLessonConflict">) =>
        apiFetch<PlannerBlock | { data: PlannerBlock; meta?: Record<string, unknown> }>(ENDPOINTS.planner.move(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }).then(unwrapMutationResult),
    resize: (id: number, payload: Pick<PlannerBlockPayload, "startAt" | "endAt" | "allowLessonConflict">) =>
        apiFetch<PlannerBlock | { data: PlannerBlock; meta?: Record<string, unknown> }>(ENDPOINTS.planner.resize(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }).then(unwrapMutationResult),
    suggestions: (payload: PlannerSuggestionsPayload) =>
        apiFetch<PlannerSuggestion>(ENDPOINTS.planner.suggestDay, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    applySuggestions: (blocks: PlannerSuggestion["blocks"]) =>
        apiFetch<PlannerBlock[]>(ENDPOINTS.planner.applySuggestions, {
            method: "POST",
            body: JSON.stringify({ blocks }),
        }),
};
