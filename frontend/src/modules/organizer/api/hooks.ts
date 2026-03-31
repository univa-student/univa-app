import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeNote, normalizeTask } from "../lib/normalize";
import type { NoteFilters, NotePayload, TaskFilters, TaskPayload } from "../model/types";
import {
    createNoteRequest,
    createTaskRequest,
    deleteNoteRequest,
    deleteTaskRequest,
    noteQueries,
    organizerQueries,
    setNoteArchivedRequest,
    setNotePinnedRequest,
    taskQueries,
    updateNoteRequest,
    updateTaskRequest,
} from "./queries";

export function useTasks(filters?: TaskFilters) {
    return useQuery(taskQueries.list(filters));
}

export function useNotes(filters?: NoteFilters) {
    return useQuery(noteQueries.list(filters));
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: TaskPayload) => normalizeTask(await createTaskRequest(payload)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<TaskPayload> }) =>
            normalizeTask(await updateTaskRequest(id, payload)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTaskRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: NotePayload) => normalizeNote(await createNoteRequest(payload)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<NotePayload> }) =>
            normalizeNote(await updateNoteRequest(id, payload)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useSetNotePinned() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) =>
            normalizeNote(await setNotePinnedRequest(id, isPinned)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useSetNoteArchived() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, archived }: { id: number; archived: boolean }) =>
            normalizeNote(await setNoteArchivedRequest(id, archived)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteNoteRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizerQueries.all() }).then(() => {});
        },
    });
}
