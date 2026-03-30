import type { FileItem, FolderItem } from "@/modules/files/model/types";

export interface GroupUserSummary {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    avatarPath: string | null;
}

export interface Group {
    id: number;
    name: string;
    code: string;
    slug: string;
    description: string | null;
    avatar: string | null;
    color: string | null;
    visibility: "private" | "public";
    joinPolicy: string;
    isActive: boolean;
    institutionName: string | null;
    institutionShortName: string | null;
    facultyName: string | null;
    departmentName: string | null;
    specialtyName: string | null;
    course: number | null;
    studyYear: number | null;
    educationLevel: string | null;
    studyForm: string | null;
    inviteRole?: string | null;
    editRole?: string | null;
    manageSubjectsRole?: string | null;
    manageScheduleRole?: string | null;
    manageDeadlinesRole?: string | null;
    manageFilesRole?: string | null;
    postAnnouncementsRole?: string | null;
    createPollsRole?: string | null;
    owner?: GroupUserSummary | null;
    creator?: GroupUserSummary | null;
    membersCount?: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface GroupMember {
    id: number;
    groupId: number;
    userId: number;
    role: "owner" | "moderator" | "headman" | "student";
    status: "active" | "invited" | "pending" | "blocked" | "left";
    nicknameInGroup: string | null;
    subgroup: string | null;
    joinedAt: string | null;
    leftAt: string | null;
    user?: GroupUserSummary | null;
}

export interface GroupSubject {
    id: number;
    groupId: number;
    name: string;
    teacherName: string | null;
    color: string | null;
    description: string | null;
}

export interface GroupChannel {
    id: number;
    groupId: number;
    groupSubjectId: number | null;
    name: string;
    slug: string;
    type: "general" | "announcements" | "subject" | "custom";
    description: string | null;
    isDefault: boolean;
    subject?: GroupSubject | null;
}

export interface GroupMessage {
    id: number;
    groupChannelId: number;
    userId: number | null;
    fileId: number | null;
    replyToId: number | null;
    type: string;
    content: string | null;
    isImportant: boolean;
    mentions?: string[] | null;
    reactions?: Record<string, string[]> | null;
    createdAt: string | null;
    updatedAt: string | null;
    user?: GroupUserSummary | null;
    file?: FileItem | null;
    attachments?: FileItem[];
}

export interface GroupAnnouncement {
    id: number;
    groupId: number;
    groupChannelId: number | null;
    title: string;
    content: string;
    type: string;
    isPinned: boolean;
    requiresAcknowledgement: boolean;
    deadlineAt: string | null;
    acknowledged?: boolean;
    attachments?: FileItem[];
    creator?: GroupUserSummary | null;
    createdAt: string | null;
}

export interface GroupInvite {
    id: number;
    groupId: number;
    createdBy: number;
    code: string;
    token: string;
    status: "active" | "revoked" | "expired";
    maxUses: number | null;
    usesCount: number;
    expiresAt: string | null;
    creator?: GroupUserSummary | null;
    createdAt: string | null;
}

export interface GroupJoinRequest {
    id: number;
    groupId: number;
    userId: number;
    message: string | null;
    status: "pending" | "approved" | "rejected";
    reviewedBy: number | null;
    reviewedAt: string | null;
    user?: GroupUserSummary | null;
    reviewer?: GroupUserSummary | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface GroupPollOption {
    id: number;
    label: string;
    position: number;
    votesCount: number;
    votedByMe: boolean;
}

export interface GroupPoll {
    id: number;
    groupId: number;
    title: string;
    description: string | null;
    allowsMultiple: boolean;
    isAnonymous: boolean;
    showResults: boolean;
    status: "open" | "closed";
    closesAt: string | null;
    options?: GroupPollOption[];
}

export interface GroupDeadline {
    id: number;
    groupId: number;
    groupSubjectId: number | null;
    title: string;
    description: string | null;
    type: string;
    priority: string;
    dueAt: string;
    subject?: GroupSubject | null;
    myStatus?: {
        status: string;
        completedAt: string | null;
    } | null;
    attachments?: FileItem[];
}

export interface GroupScheduleItem {
    id: number;
    lessonId: number | null;
    date: string;
    startsAt: string;
    endsAt: string | null;
    subject: {
        id: number;
        name: string;
        teacherName: string | null;
        color: string | null;
    };
    examType?: {
        id: number;
        code: string;
        name: string;
    } | null;
    lessonType?: {
        id: number;
        code: string;
        name: string;
        color: string | null;
    } | null;
    deliveryMode?: {
        id: number;
        code: string;
        name: string;
    } | null;
    location?: string | null;
    note?: string | null;
    source: string;
}

export interface GroupOverview {
    group: Pick<Group, "id" | "name" | "code" | "slug" | "color">;
    membersCount: number;
    upcomingSchedule: GroupScheduleItem[];
    upcomingDeadlines: GroupDeadline[];
    announcements: GroupAnnouncement[];
    recentFiles: FileItem[];
    recentActivity: GroupMessage[];
}

export interface CreateGroupPayload {
    name: string;
    code: string;
    description?: string;
    color?: string;
    institutionName?: string;
    institutionShortName?: string;
    facultyName?: string;
    departmentName?: string;
    specialtyName?: string;
    course?: number;
    studyYear?: number;
}

export interface JoinGroupPayload {
    identifier: string;
}

export interface UpdateGroupPayload {
    name?: string;
    code?: string;
    description?: string;
    color?: string;
    visibility?: "private" | "public";
    joinPolicy?: "invite_only" | "invite_or_request" | "code_or_request";
    institutionName?: string;
    institutionShortName?: string;
    facultyName?: string;
    departmentName?: string;
    specialtyName?: string;
    course?: number;
    studyYear?: number;
    educationLevel?: string;
    studyForm?: string;
    inviteRole?: "owner" | "moderator" | "headman" | "student";
    editRole?: "owner" | "moderator" | "headman" | "student";
    manageSubjectsRole?: "owner" | "moderator" | "headman" | "student";
    manageScheduleRole?: "owner" | "moderator" | "headman" | "student";
    manageDeadlinesRole?: "owner" | "moderator" | "headman" | "student";
    manageFilesRole?: "owner" | "moderator" | "headman" | "student";
    postAnnouncementsRole?: "owner" | "moderator" | "headman" | "student";
    createPollsRole?: "owner" | "moderator" | "headman" | "student";
}

export interface CreateGroupSubjectPayload {
    name: string;
    teacherName?: string;
    color?: string;
    description?: string;
}

export interface CreateGroupAnnouncementPayload {
    title: string;
    content: string;
    type?: string;
    isPinned?: boolean;
    requiresAcknowledgement?: boolean;
    deadlineAt?: string;
}

export interface CreateGroupDeadlinePayload {
    groupSubjectId?: number;
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    dueAt: string;
}

export interface CreateGroupInvitePayload {
    maxUses?: number;
    expiresAt?: string;
}

export interface CreateGroupFolderPayload {
    name: string;
    parentId?: number;
    groupSubjectId?: number;
}

export interface ImportGroupFilesPayload {
    fileIds: number[];
    groupSubjectId?: number;
}

export interface CreateGroupMessagePayload {
    content?: string;
    type?: string;
    isImportant?: boolean;
}

export interface CreateGroupLessonPayload {
    groupSubjectId: number;
    weekday: number;
    startsAt: string;
    endsAt: string;
    lessonTypeId: number;
    deliveryModeId: number;
    recurrenceRuleId: number;
    locationText?: string;
    note?: string;
    activeFrom: string;
    activeTo?: string;
}

export interface CreateGroupPollPayload {
    title: string;
    description?: string;
    allowsMultiple?: boolean;
    isAnonymous?: boolean;
    showResults?: boolean;
    closesAt?: string;
    options: Array<{
        label: string;
        position?: number;
    }>;
}

export interface GroupFilesResponse {
    files: FileItem[];
    folders: FolderItem[];
}
