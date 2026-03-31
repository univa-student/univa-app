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
        sessions: `${API}/me/sessions`,
        revokeSession: (sessionId: string) =>
            `${API}/me/sessions/${encodeURIComponent(sessionId)}`,
    },

    me: {
        profile: `${API}/me/profile`,
        password: `${API}/me/password`,
        avatar: `${API}/me/avatar`,
    },

    friends: {
        list: `${API}/me/friends`,
        pending: `${API}/me/friends/pending`,
        search: (query: string) => withQuery(`${API}/me/friends/search`, { q: query }),
        status: (userId: number) => `${API}/me/users/${userId}/friendship`,
        send: (userId: number) => `${API}/me/users/${userId}/friends`,
        accept: (userId: number) => `${API}/me/friends/${userId}/accept`,
        remove: (userId: number) => `${API}/me/friends/${userId}`,
    },

    profiles: {
        me: `${API}/me/profile`,
        byUsername: (username: string) =>
            `${API}/profiles/${encodeURIComponent(username)}`,
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

    planner: {
        day: (date: string) => withQuery(`${API}/planner/day`, { date }),
        week: (date: string) => withQuery(`${API}/planner/week`, { date }),
        blocks: (startAt: string, endAt: string) =>
            withQuery(`${API}/planner/blocks`, { start_at: startAt, end_at: endAt }),
        base: `${API}/planner/blocks`,
        block: (id: number) => `${API}/planner/blocks/${id}`,
        status: (id: number) => `${API}/planner/blocks/${id}/status`,
        move: (id: number) => `${API}/planner/blocks/${id}/move`,
        resize: (id: number) => `${API}/planner/blocks/${id}/resize`,
        suggestDay: `${API}/planner/suggestions/day`,
        applySuggestions: `${API}/planner/suggestions/apply`,
        taskPlan: (taskId: number) => `${API}/planner/tasks/${taskId}/plan`,
        deadlinePlan: (deadlineId: number) => `${API}/planner/deadlines/${deadlineId}/plan`,
    },

    organizer: {
        tasks: {
            base: `${API}/tasks`,
            id: (id: number) => `${API}/tasks/${id}`,
        },
        notes: {
            base: `${API}/notes`,
            id: (id: number) => `${API}/notes/${id}`,
            pin: (id: number) => `${API}/notes/${id}/pin`,
            archive: (id: number) => `${API}/notes/${id}/archive`,
        },
    },

    groups: {
        list: `${API}/groups`,
        create: `${API}/groups`,
        join: `${API}/groups/join`,
        show: (id: number) => `${API}/groups/${id}`,
        update: (id: number) => `${API}/groups/${id}`,
        delete: (id: number) => `${API}/groups/${id}`,
        overview: (id: number) => `${API}/groups/${id}/overview`,
        members: (id: number) => `${API}/groups/${id}/members`,
        leave: (id: number) => `${API}/groups/${id}/leave`,
        invites: (id: number) => `${API}/groups/${id}/invites`,
        invite: (groupId: number, inviteId: number) => `${API}/groups/${groupId}/invites/${inviteId}`,
        joinRequests: (id: number) => `${API}/groups/${id}/join-requests`,
        joinRequest: (groupId: number, requestId: number) => `${API}/groups/${groupId}/join-requests/${requestId}`,
        subjects: (id: number) => `${API}/groups/${id}/subjects`,
        announcements: (id: number) => `${API}/groups/${id}/announcements`,
        announcement: (groupId: number, announcementId: number) => `${API}/groups/${groupId}/announcements/${announcementId}`,
        acknowledgeAnnouncement: (groupId: number, announcementId: number) =>
            `${API}/groups/${groupId}/announcements/${announcementId}/acknowledge`,
        polls: (id: number) => `${API}/groups/${id}/polls`,
        poll: (groupId: number, pollId: number) => `${API}/groups/${groupId}/polls/${pollId}`,
        votePoll: (groupId: number, pollId: number) => `${API}/groups/${groupId}/polls/${pollId}/vote`,
        channels: (id: number) => `${API}/groups/${id}/channels`,
        channelMessages: (groupId: number, channelId: number) =>
            `${API}/groups/${groupId}/channels/${channelId}/messages`,
        deadlines: (id: number) => `${API}/groups/${id}/deadlines`,
        deadline: (groupId: number, deadlineId: number) => `${API}/groups/${groupId}/deadlines/${deadlineId}`,
        deadlineProgress: (groupId: number, deadlineId: number) =>
            `${API}/groups/${groupId}/deadlines/${deadlineId}/progress`,
        schedule: (id: number, from: string, to: string) =>
            withQuery(`${API}/groups/${id}/schedule`, { from, to }),
        scheduleLessons: (id: number) => `${API}/groups/${id}/schedule/lessons`,
        files: (id: number, folderId?: number | null, groupSubjectId?: number | null) =>
            withQuery(`${API}/groups/${id}/files`, {
                folder_id: folderId,
                group_subject_id: groupSubjectId,
            }),
        importFiles: (id: number) => `${API}/groups/${id}/files/import`,
        file: (groupId: number, fileId: number) => `${API}/groups/${groupId}/files/${fileId}`,
        downloadFile: (groupId: number, fileId: number) => `${API}/groups/${groupId}/files/${fileId}/download`,
        recentFiles: (id: number) => `${API}/groups/${id}/files/recent`,
        folders: (id: number, parentId?: number | null, groupSubjectId?: number | null) =>
            withQuery(`${API}/groups/${id}/folders`, {
                parent_id: parentId,
                group_subject_id: groupSubjectId,
            }),
    },

    // ── AI ───────────────────────────────────────────────
    summaries: {
        list: `${API}/summaries`,
        create: `${API}/summaries`,
        show: (id: number) => `${API}/summaries/${id}`,
        delete: (id: number) => `${API}/summaries/${id}`,
        generate: (fileId: number) =>
            `${API}/files/${fileId}/summary`,
    },

    dailyDigests: {
        latest: (date?: string) =>
            withQuery(`${API}/daily-digests/latest`, { date }),
    },
} as const;
