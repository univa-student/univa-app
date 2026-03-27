import type {
    GroupAnnouncementView,
    GroupChannelView,
    GroupDeadlineView,
    GroupFileView,
    GroupInviteView,
    GroupJoinRequestView,
    GroupMemberView,
    GroupMessageView,
    GroupPollOptionView,
    GroupPollView,
    GroupRole,
    GroupScheduleItemView,
    GroupSubjectView,
    GroupUserView,
    GroupView,
} from "./view";

function read<T>(value: unknown, ...keys: string[]): T | undefined {
    if (!value || typeof value !== "object") return undefined;
    const source = value as Record<string, unknown>;
    for (const key of keys) {
        if (source[key] !== undefined) {
            return source[key] as T;
        }
    }
    return undefined;
}

export function normalizeUser(raw: unknown): GroupUserView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        firstName: read<string>(raw, "firstName", "first_name") ?? "Користувач",
        lastName: read<string | null>(raw, "lastName", "last_name") ?? null,
        username: read<string>(raw, "username") ?? "",
        avatarPath: read<string | null>(raw, "avatarPath", "avatar_path") ?? null,
    };
}

export function normalizeGroup(raw: unknown): GroupView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        name: read<string>(raw, "name") ?? "Група",
        code: read<string>(raw, "code") ?? "—",
        description: read<string | null>(raw, "description") ?? null,
        color: read<string | null>(raw, "color") ?? null,
        visibility: read<"private" | "public">(raw, "visibility") ?? "private",
        joinPolicy:
            read<GroupView["joinPolicy"]>(raw, "joinPolicy", "join_policy") ??
            "invite_or_request",
        membersCount: read<number>(raw, "membersCount", "members_count") ?? 0,
        inviteRole: read<GroupRole>(raw, "inviteRole", "invite_role") ?? "headman",
        editRole: read<GroupRole>(raw, "editRole", "edit_role") ?? "moderator",
        manageSubjectsRole:
            read<GroupRole>(raw, "manageSubjectsRole", "manage_subjects_role") ?? "headman",
        manageScheduleRole:
            read<GroupRole>(raw, "manageScheduleRole", "manage_schedule_role") ?? "headman",
        manageDeadlinesRole:
            read<GroupRole>(raw, "manageDeadlinesRole", "manage_deadlines_role") ?? "headman",
        manageFilesRole:
            read<GroupRole>(raw, "manageFilesRole", "manage_files_role") ?? "headman",
        postAnnouncementsRole:
            read<GroupRole>(raw, "postAnnouncementsRole", "post_announcements_role") ??
            "headman",
        createPollsRole:
            read<GroupRole>(raw, "createPollsRole", "create_polls_role") ?? "headman",
        institutionName:
            read<string | null>(raw, "institutionName", "institution_name") ?? null,
        institutionShortName:
            read<string | null>(raw, "institutionShortName", "institution_short_name") ?? null,
        facultyName: read<string | null>(raw, "facultyName", "faculty_name") ?? null,
        specialtyName:
            read<string | null>(raw, "specialtyName", "specialty_name") ?? null,
        course: read<number | null>(raw, "course") ?? null,
        studyYear: read<number | null>(raw, "studyYear", "study_year") ?? null,
    };
}

export function normalizeMember(raw: unknown): GroupMemberView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        userId: read<number>(raw, "userId", "user_id") ?? 0,
        role: read<GroupRole>(raw, "role") ?? "student",
        status: read<string>(raw, "status") ?? "active",
        joinedAt: read<string | null>(raw, "joinedAt", "joined_at") ?? null,
        subgroup: read<string | null>(raw, "subgroup") ?? null,
        user: normalizeUser(read<unknown>(raw, "user")),
    };
}

export function normalizeSubject(raw: unknown): GroupSubjectView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        name: read<string>(raw, "name") ?? "Предмет",
        teacherName: read<string | null>(raw, "teacherName", "teacher_name") ?? null,
        color: read<string | null>(raw, "color") ?? null,
        description: read<string | null>(raw, "description") ?? null,
    };
}

export function normalizeScheduleItem(raw: unknown): GroupScheduleItemView | null {
    if (!raw || typeof raw !== "object") return null;
    const subject = normalizeSubject(read<unknown>(raw, "subject"));
    if (!subject) return null;
    const lessonType = read<Record<string, unknown> | null>(raw, "lessonType", "lesson_type");
    const deliveryMode = read<Record<string, unknown> | null>(
        raw,
        "deliveryMode",
        "delivery_mode",
    );

    return {
        id: read<number>(raw, "id") ?? 0,
        lessonId: read<number | null>(raw, "lessonId", "lesson_id") ?? null,
        date: read<string>(raw, "date") ?? "",
        startsAt: read<string>(raw, "startsAt", "starts_at") ?? "",
        endsAt: read<string | null>(raw, "endsAt", "ends_at") ?? null,
        subject,
        lessonTypeName: (lessonType?.name as string | null) ?? null,
        lessonTypeCode: (lessonType?.code as string | null) ?? null,
        deliveryModeName: (deliveryMode?.name as string | null) ?? null,
        deliveryModeCode: (deliveryMode?.code as string | null) ?? null,
        location: read<string | null>(raw, "location") ?? null,
        note: read<string | null>(raw, "note") ?? null,
    };
}

export function normalizeDeadline(raw: unknown): GroupDeadlineView | null {
    if (!raw || typeof raw !== "object") return null;
    const subject = normalizeSubject(read<unknown>(raw, "subject"));
    const myStatusRaw = read<Record<string, unknown> | null>(raw, "myStatus", "my_status");
    return {
        id: read<number>(raw, "id") ?? 0,
        title: read<string>(raw, "title") ?? "Дедлайн",
        description: read<string | null>(raw, "description") ?? null,
        type: read<string>(raw, "type") ?? "other",
        priority: read<string>(raw, "priority") ?? "medium",
        dueAt: read<string>(raw, "dueAt", "due_at") ?? "",
        subject,
        myStatus: myStatusRaw
            ? {
                  status:
                      read<"not_started" | "in_progress" | "completed">(
                          myStatusRaw,
                          "status",
                      ) ?? "not_started",
                  completedAt:
                      read<string | null>(myStatusRaw, "completedAt", "completed_at") ??
                      null,
              }
            : null,
    };
}

export function normalizeAnnouncement(raw: unknown): GroupAnnouncementView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        title: read<string>(raw, "title") ?? "Оголошення",
        content: read<string>(raw, "content") ?? "",
        type: read<string>(raw, "type") ?? "organizational",
        isPinned: read<boolean>(raw, "isPinned", "is_pinned") ?? false,
        requiresAcknowledgement:
            read<boolean>(raw, "requiresAcknowledgement", "requires_acknowledgement") ??
            false,
        deadlineAt: read<string | null>(raw, "deadlineAt", "deadline_at") ?? null,
        acknowledged: read<boolean>(raw, "acknowledged") ?? false,
        creator: normalizeUser(read<unknown>(raw, "creator")),
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
    };
}

export function normalizeInvite(raw: unknown): GroupInviteView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        code: read<string>(raw, "code") ?? "",
        token: read<string>(raw, "token") ?? "",
        status: read<string>(raw, "status") ?? "active",
        maxUses: read<number | null>(raw, "maxUses", "max_uses") ?? null,
        usesCount: read<number>(raw, "usesCount", "uses_count") ?? 0,
        expiresAt: read<string | null>(raw, "expiresAt", "expires_at") ?? null,
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
    };
}

export function normalizeJoinRequest(raw: unknown): GroupJoinRequestView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        message: read<string | null>(raw, "message") ?? null,
        status: read<string>(raw, "status") ?? "pending",
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
        user: normalizeUser(read<unknown>(raw, "user")),
    };
}

export function normalizePoll(raw: unknown): GroupPollView | null {
    if (!raw || typeof raw !== "object") return null;
    const optionsRaw = read<unknown[]>(raw, "options") ?? [];
    return {
        id: read<number>(raw, "id") ?? 0,
        title: read<string>(raw, "title") ?? "Опитування",
        description: read<string | null>(raw, "description") ?? null,
        allowsMultiple: read<boolean>(raw, "allowsMultiple", "allows_multiple") ?? false,
        isAnonymous: read<boolean>(raw, "isAnonymous", "is_anonymous") ?? false,
        showResults: read<boolean>(raw, "showResults", "show_results") ?? true,
        status: read<"open" | "closed">(raw, "status") ?? "open",
        closesAt: read<string | null>(raw, "closesAt", "closes_at") ?? null,
        options: optionsRaw
            .map((option) => {
                if (!option || typeof option !== "object") return null;
                return {
                    id: read<number>(option, "id") ?? 0,
                    label: read<string>(option, "label") ?? "",
                    position: read<number>(option, "position") ?? 0,
                    votesCount: read<number>(option, "votesCount", "votes_count") ?? 0,
                    votedByMe: read<boolean>(option, "votedByMe", "voted_by_me") ?? false,
                };
            })
            .filter((option): option is GroupPollOptionView => option !== null)
            .sort((a, b) => a.position - b.position),
    };
}

export function normalizeChannel(raw: unknown): GroupChannelView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        name: read<string>(raw, "name") ?? "Канал",
        type: read<string>(raw, "type") ?? "custom",
        description: read<string | null>(raw, "description") ?? null,
    };
}

export function normalizeMessage(raw: unknown): GroupMessageView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        content: read<string | null>(raw, "content") ?? null,
        type: read<string>(raw, "type") ?? "text",
        isImportant: read<boolean>(raw, "isImportant", "is_important") ?? false,
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
        user: normalizeUser(read<unknown>(raw, "user")),
    };
}

export function normalizeFile(raw: unknown): GroupFileView | null {
    if (!raw || typeof raw !== "object") return null;
    const groupSubjectRaw = read<Record<string, unknown> | null>(
        raw,
        "groupSubject",
        "group_subject",
    );

    return {
        id: read<number>(raw, "id") ?? 0,
        originalName: read<string>(raw, "originalName", "original_name") ?? "Файл",
        size: read<number>(raw, "size") ?? 0,
        mimeType: read<string | null>(raw, "mimeType", "mime_type") ?? null,
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
        groupSubject: groupSubjectRaw
            ? {
                  id: read<number>(groupSubjectRaw, "id") ?? 0,
                  name: read<string>(groupSubjectRaw, "name") ?? "Предмет",
                  color: read<string | null>(groupSubjectRaw, "color") ?? null,
              }
            : null,
    };
}

export function roleAllows(currentRole: GroupRole | null, requiredRole: GroupRole): boolean {
    if (!currentRole) return false;

    const ranks: Record<GroupRole, number> = {
        owner: 400,
        moderator: 300,
        headman: 200,
        student: 100,
    };

    return ranks[currentRole] >= ranks[requiredRole];
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export function toDateInputValue(date: Date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

export function toDateTimeInputValue(date: Date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}
