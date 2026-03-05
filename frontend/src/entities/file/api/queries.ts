import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    FileItem, FolderItem, CreateFolderPayload, UpdateFolderPayload, UpdateFilePayload,
    FolderTreeResponse
} from "../model/types";

// ─── Files ────────────────────────────────────────────────────────────────────

export const fileQueries = {
    list(folderId?: number | null, subjectId?: number | null) {
        return {
            queryKey: ["files", "list", folderId ?? "root", subjectId ?? "all"],
            queryFn: () => apiFetch<FileItem[]>(ENDPOINTS.files.list(folderId, subjectId)),
        };
    },

    recent() {
        return {
            queryKey: ["files", "recent"],
            queryFn: () => apiFetch<FileItem[]>(ENDPOINTS.files.recent),
        };
    },

    search(query: string, subjectId?: number | null) {
        return {
            queryKey: ["files", "search", query, subjectId ?? "all"],
            queryFn: () => apiFetch<FileItem[]>(ENDPOINTS.files.search(query, subjectId)),
            enabled: query.length >= 2,
        };
    },

    show(id: number) {
        return {
            queryKey: ["files", "detail", id],
            queryFn: () => apiFetch<FileItem>(ENDPOINTS.files.show(id)),
        };
    },

    upload(formData: FormData) {
        return {
            queryKey: ["files", "upload"],
            queryFn: () =>
                apiFetch<FileItem>(ENDPOINTS.files.upload, {
                    method: "POST",
                    body: formData,
                }),
        };
    },

    update(id: number, payload: UpdateFilePayload) {
        return {
            queryKey: ["files", "update", id],
            queryFn: () =>
                apiFetch<FileItem>(ENDPOINTS.files.update(id), {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                }),
        };
    },

    delete(id: number) {
        return {
            queryKey: ["files", "delete", id],
            queryFn: () =>
                apiFetch<void>(ENDPOINTS.files.delete(id), {
                    method: "DELETE",
                }),
        };
    },
};

// ─── Folders ──────────────────────────────────────────────────────────────────

export const folderQueries = {
    list(parentId?: number | null) {
        return {
            queryKey: ["folders", "list", parentId ?? "root"],
            queryFn: () => apiFetch<FolderItem[]>(ENDPOINTS.folders.list(parentId)),
        };
    },

    create(payload: CreateFolderPayload) {
        return {
            queryKey: ["folders", "create"],
            queryFn: () =>
                apiFetch<FolderItem>(ENDPOINTS.folders.create, {
                    method: "POST",
                    body: JSON.stringify(payload),
                }),
        };
    },

    update(id: number, payload: UpdateFolderPayload) {
        return {
            queryKey: ["folders", "update", id],
            queryFn: () =>
                apiFetch<FolderItem>(ENDPOINTS.folders.update(id), {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                }),
        };
    },

    delete(id: number) {
        return {
            queryKey: ["folders", "delete", id],
            queryFn: () =>
                apiFetch<void>(ENDPOINTS.folders.delete(id), {
                    method: "DELETE",
                }),
        };
    },

    /** Full folder tree (with nested children + files) in one request */
    tree() {
        return {
            queryKey: ["folders", "tree"],
            queryFn: () => apiFetch<FolderTreeResponse>(ENDPOINTS.folders.tree),
        };
    },
};