const API = "/api/v1";

// helper для query
function withQuery(path: string, params?: Record<string, unknown>) {
    if (!params) return path;

    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            search.set(key, String(value));
        }
    });

    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
}

export const ENDPOINTS = {
    auth: {
        csrf: "/sanctum/csrf-cookie",
        register: `${API}/register`,
        login: `${API}/login`,
        logout: `${API}/logout`,
        me: `${API}/me/univa-user`,
    },

    me: {
        profile: `${API}/me/profile`,
        password: `${API}/me/password`,
        avatar: `${API}/me/avatar`,
    },

    profiles: {
        me: `${API}/me/profile`,
        update: `${API}/me/profile/details`,
        university: `${API}/me/profile/university`,
        universityInformation: `${API}/me/profile/university/information`,
        selectRegion: `${API}/me/profile/university/select-region`,
        selectUniversity: `${API}/me/profile/university/select`,
    },

    settings: {
        me: `${API}/me/settings`,
        group: (groupId: number) =>
            withQuery(`${API}/settings`, { group_id: groupId }),
        update: (key: string) =>
            `${API}/settings/${encodeURIComponent(key)}`,
        bulk: `${API}/settings`,
    },

    // ── Schedule ─────────────────────────────────────────
    schedule: (from: string, to: string) =>
        withQuery(`${API}/schedule`, { from, to }),

    // ── Subjects ─────────────────────────────────────────
    subjects: {
        list: `${API}/subjects`,
        create: `${API}/subjects`,
        update: (id: number) => `${API}/subjects/${id}`,
        delete: (id: number) => `${API}/subjects/${id}`,
        folder: (id: number) => `${API}/subjects/${id}/folder`,
    },

    lessons: {
        create: `${API}/schedule-lessons`,
        show: (id: number) => `${API}/schedule-lessons/${id}`,
        update: (id: number) => `${API}/schedule-lessons/${id}`,
        delete: (id: number) => `${API}/schedule-lessons/${id}`,
        materials: (id: number) =>
            `${API}/schedule-lessons/${id}/materials`,
        createException: (lessonId: number) =>
            `${API}/schedule-lessons/${lessonId}/exceptions`,
        deleteException: (id: number) => `${API}/exceptions/${id}`,
    },

    exams: {
        list: (from: string, to: string) =>
            withQuery(`${API}/exams`, { from, to }),
        create: `${API}/exams`,
        update: (id: number) => `${API}/exams/${id}`,
        delete: (id: number) => `${API}/exams/${id}`,
    },

    dictionaries: {
        lessonTypes: `${API}/dictionaries/lesson-types`,
        deliveryModes: `${API}/dictionaries/delivery-modes`,
        examTypes: `${API}/dictionaries/exam-types`,
        recurrenceRules: `${API}/dictionaries/recurrence-rules`,
    },

    // ── Files ────────────────────────────────────────────
    files: {
        list: (folderId?: number | null, subjectId?: number | null) =>
            withQuery(`${API}/files`, {
                folder_id: folderId,
                subject_id: subjectId,
            }),

        upload: `${API}/files`,
        show: (id: number) => `${API}/files/${id}`,
        update: (id: number) => `${API}/files/${id}`,
        delete: (id: number) => `${API}/files/${id}`,
        download: (id: number) => `${API}/files/${id}/download`,

        search: (q: string, subjectId?: number | null) =>
            withQuery(`${API}/files/search`, {
                q,
                subject_id: subjectId,
            }),

        recent: `${API}/files/recent`,
    },

    storage: {
        info: `${API}/storage/info`,
    },

    folders: {
        list: (parentId?: number | null) =>
            withQuery(`${API}/folders`, { parent_id: parentId }),
        tree: `${API}/folders/tree`,
        create: `${API}/folders`,
        update: (id: number) => `${API}/folders/${id}`,
        delete: (id: number) => `${API}/folders/${id}`,
    },

    deadlines: {
        base: `${API}/deadlines`,
        stats: `${API}/deadlines/stats`,
        id: (id: number) => `${API}/deadlines/${id}`,
    },

    // ── AI ───────────────────────────────────────────────
    summaries: {
        list: `${API}/summaries`,
        show: (id: number) => `${API}/summaries/${id}`,
        delete: (id: number) => `${API}/summaries/${id}`,
        generate: (fileId: number) =>
            `${API}/files/${fileId}/summary`,
    },
} as const;
