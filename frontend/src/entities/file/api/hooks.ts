import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fileQueries, folderQueries } from "./queries";
import type { CreateFolderPayload, UpdateFolderPayload, UpdateFilePayload } from "../model/types";

// ─── Files ────────────────────────────────────────────────────────────────────

export function useFiles(folderId?: number | null, subjectId?: number | null) {
    return useQuery(fileQueries.list(folderId, subjectId));
}

export function useRecentFiles() {
    return useQuery(fileQueries.recent());
}

export function useSearchFiles(query: string, subjectId?: number | null) {
    return useQuery({
        ...fileQueries.search(query, subjectId),
        enabled: query.length >= 2,
    });
}

export function useFileDetail(id: number) {
    return useQuery(fileQueries.show(id));
}

export function useUploadFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => fileQueries.upload(formData).queryFn(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["files"] });
            qc.invalidateQueries({ queryKey: ["folders", "tree"] });
        },
    });
}

export function useUpdateFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateFilePayload }) =>
            fileQueries.update(id, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
    });
}

export function useDeleteFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => fileQueries.delete(id).queryFn(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["files"] });
            qc.invalidateQueries({ queryKey: ["folders", "tree"] });
        },
    });
}

// ─── Folders ──────────────────────────────────────────────────────────────────

export function useFolders(parentId?: number | null) {
    return useQuery(folderQueries.list(parentId));
}

export function useCreateFolder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFolderPayload) => folderQueries.create(payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
    });
}

export function useUpdateFolder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateFolderPayload }) =>
            folderQueries.update(id, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
    });
}

export function useDeleteFolder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => folderQueries.delete(id).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
    });
}

export function useFolderTree() {
    return useQuery(folderQueries.tree());
}
