import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type {
    ProfileInformation,
    SaveStudentUniversityPayload,
    StudentProfile,
    StudentUniversity,
    UniversityLookupDetails,
    UniversityLookupItem,
    UpdateStudentProfilePayload,
} from "../model/types";

export const profileQueries = {
    me: () => ({
        queryKey: ["me", "student-profile"],
        queryFn: () =>
            apiFetch<StudentProfile>(ENDPOINTS.profiles.me, {
                cacheTtlMs: 60_000,
            }),
    }),
    update: (payload: UpdateStudentProfilePayload) => ({
        queryKey: ["me", "student-profile", "update"],
        queryFn: () =>
            apiFetch<StudentProfile>(ENDPOINTS.profiles.update, {
                method: "PATCH",
                body: JSON.stringify(payload),
            }),
    }),
    information: () => ({
        queryKey: ["profiles", "information"],
        queryFn: () =>
            apiFetch<ProfileInformation>(ENDPOINTS.profiles.universityInformation, {
                cacheTtlMs: 10 * 60_000,
            }),
    }),
    universitiesByRegion: (regionCode: string) => ({
        queryKey: ["profiles", "universities", regionCode],
        queryFn: () =>
            apiFetch<UniversityLookupItem[]>(ENDPOINTS.profiles.selectRegion, {
                method: "POST",
                body: JSON.stringify({
                    regionCode,
                }),
            }),
    }),
    universityDetails: (universityId: string) => ({
        queryKey: ["profiles", "universities", "details", universityId],
        queryFn: () =>
            apiFetch<UniversityLookupDetails>(ENDPOINTS.profiles.selectUniversity, {
                method: "POST",
                body: JSON.stringify({
                    id: universityId,
                }),
            }),
    }),
    saveUniversity: (payload: SaveStudentUniversityPayload) => ({
        queryKey: ["me", "student-profile", "university", "save"],
        queryFn: () =>
            apiFetch<StudentUniversity>(ENDPOINTS.profiles.university, {
                method: "POST",
                body: JSON.stringify({
                    universityId: payload.universityId,
                    regionCode: payload.regionCode,
                    specialityName: payload.specialityName ?? null,
                    groupCode: payload.groupCode ?? null,
                    course: payload.course,
                }),
            }),
    }),
    removeUniversity: () => ({
        queryKey: ["me", "student-profile", "university", "remove"],
        queryFn: () =>
            apiFetch<StudentProfile>(ENDPOINTS.profiles.university, {
                method: "DELETE",
            }),
    }),
};
