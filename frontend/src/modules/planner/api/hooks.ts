import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plannerQueries } from "./queries";
import type { PlannerBlockPayload, PlannerStatusPayload, PlannerSuggestion } from "../model/types";

export function usePlannerDay(date: string) {
    return useQuery(plannerQueries.day(date));
}

export function usePlannerWeek(date: string) {
    return useQuery(plannerQueries.week(date));
}

export function useCreatePlannerBlock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: plannerQueries.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}

export function useUpdatePlannerBlock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<PlannerBlockPayload> }) =>
            plannerQueries.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}

export function useDeletePlannerBlock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: plannerQueries.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}

export function usePlannerBlockStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: PlannerStatusPayload }) =>
            plannerQueries.status(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}

export function useMovePlannerBlock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, startAt, endAt, allowLessonConflict }: { id: number; startAt: string; endAt: string; allowLessonConflict?: boolean }) =>
            plannerQueries.move(id, { startAt, endAt, allowLessonConflict }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}

export function useResizePlannerBlock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, startAt, endAt, allowLessonConflict }: { id: number; startAt: string; endAt: string; allowLessonConflict?: boolean }) =>
            plannerQueries.resize(id, { startAt, endAt, allowLessonConflict }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}

export function useGeneratePlannerSuggestions() {
    return useMutation({
        mutationFn: plannerQueries.suggestions,
    });
}

export function useApplyPlannerSuggestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (blocks: PlannerSuggestion["blocks"]) => plannerQueries.applySuggestions(blocks),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plannerQueries.all() }).then(() => {});
        },
    });
}
