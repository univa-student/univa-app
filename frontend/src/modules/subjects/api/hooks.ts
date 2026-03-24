import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subjectQueries } from "./queries";
import type { CreateSubjectPayload } from "@/modules/subjects/model/types";

export function useSubjects() {
    return useQuery(subjectQueries.list());
}

export function useSubjectFolder(id: number) {
    return useQuery(subjectQueries.folder(id));
}

export function useCreateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSubjectPayload) =>
            subjectQueries.create(payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    });
}

export function useUpdateSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateSubjectPayload> }) =>
            subjectQueries.update(id, payload).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    });
}

export function useDeleteSubject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => subjectQueries.delete(id).queryFn(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
    });
}
