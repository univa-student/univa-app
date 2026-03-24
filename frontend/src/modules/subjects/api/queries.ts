import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Subject, CreateSubjectPayload } from "@/modules/subjects/model/types";
import type { FolderItem } from "@/modules/files/model/types";

export const subjectQueries = {
    list: () => ({
        queryKey: ["subjects"],
        queryFn: () => apiFetch<Subject[]>(ENDPOINTS.subjects.list),
        staleTime: 1000 * 60 * 10,
    }),
    create: (payload: CreateSubjectPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<Subject>(ENDPOINTS.subjects.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (id: number, payload: Partial<CreateSubjectPayload>) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<Subject>(ENDPOINTS.subjects.update(id), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    delete: (id: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<void>(ENDPOINTS.subjects.delete(id), { method: "DELETE" }),
    }),
    folder: (id: number) => ({
        queryKey: ["subjects", id, "folder"],
        queryFn: () => apiFetch<FolderItem>(ENDPOINTS.subjects.folder(id)),
    }),
};
