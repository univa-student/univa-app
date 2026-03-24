import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileQueries } from "./queries";
import type {
    SaveStudentUniversityPayload,
    UpdateStudentProfilePayload,
} from "../model/types";

export function useStudentProfile() {
    return useQuery(profileQueries.me());
}

export function useProfileInformation() {
    return useQuery(profileQueries.information());
}

export function useUniversitiesByRegion(regionCode: string | null) {
    return useQuery({
        ...profileQueries.universitiesByRegion(regionCode ?? ""),
        enabled: Boolean(regionCode),
    });
}

export function useUniversityDetails(universityId: string | null) {
    return useQuery({
        ...profileQueries.universityDetails(universityId ?? ""),
        enabled: Boolean(universityId),
    });
}

export function useUpdateStudentProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateStudentProfilePayload) =>
            profileQueries.update(payload).queryFn(),
        onSuccess: (profile) => {
            queryClient.setQueryData(["me", "student-profile"], profile);
        },
    });
}

export function useSaveStudentUniversity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SaveStudentUniversityPayload) =>
            profileQueries.saveUniversity(payload).queryFn(),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["me", "student-profile"],
            });
        },
    });
}

export function useRemoveStudentUniversity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => profileQueries.removeUniversity().queryFn(),
        onSuccess: (profile) => {
            queryClient.setQueryData(["me", "student-profile"], profile);
        },
    });
}
