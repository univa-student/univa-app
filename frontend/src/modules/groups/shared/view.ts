export type GroupRole = "owner" | "moderator" | "headman" | "student";

export interface GroupView {
    id: number;
    name: string;
    code: string;
    description: string | null;
    color: string | null;
    visibility: "private" | "public";
    joinPolicy: "invite_only" | "invite_or_request" | "code_or_request";
    membersCount: number;
    inviteRole: GroupRole;
    editRole: GroupRole;
    manageSubjectsRole: GroupRole;
    manageScheduleRole: GroupRole;
    manageDeadlinesRole: GroupRole;
    manageFilesRole: GroupRole;
    postAnnouncementsRole: GroupRole;
    createPollsRole: GroupRole;
    institutionName: string | null;
    institutionShortName: string | null;
    facultyName: string | null;
    specialtyName: string | null;
    course: number | null;
    studyYear: number | null;
}

export interface GroupUserView {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    avatarPath: string | null;
}

export interface GroupMemberView {
    id: number;
    userId: number;
    role: GroupRole;
    status: string;
    joinedAt: string | null;
    subgroup: string | null;
    user: GroupUserView | null;
}

export interface GroupSubjectView {
    id: number;
    name: string;
    teacherName: string | null;
    color: string | null;
    description: string | null;
}

export interface GroupScheduleItemView {
    id: number;
    lessonId: number | null;
    date: string;
    startsAt: string;
    endsAt: string | null;
    subject: GroupSubjectView;
    lessonTypeName: string | null;
    lessonTypeCode: string | null;
    deliveryModeName: string | null;
    deliveryModeCode: string | null;
    location: string | null;
    note: string | null;
}

export interface GroupDeadlineView {
    id: number;
    title: string;
    description: string | null;
    type: string;
    priority: string;
    dueAt: string;
    subject: GroupSubjectView | null;
    myStatus: {
        status: "not_started" | "in_progress" | "completed";
        completedAt: string | null;
    } | null;
}

export interface GroupAnnouncementView {
    id: number;
    title: string;
    content: string;
    type: string;
    isPinned: boolean;
    requiresAcknowledgement: boolean;
    deadlineAt: string | null;
    acknowledged: boolean;
    creator: GroupUserView | null;
    createdAt: string | null;
}

export interface GroupInviteView {
    id: number;
    code: string;
    token: string;
    status: string;
    maxUses: number | null;
    usesCount: number;
    expiresAt: string | null;
    createdAt: string | null;
}

export interface GroupJoinRequestView {
    id: number;
    message: string | null;
    status: string;
    createdAt: string | null;
    user: GroupUserView | null;
}

export interface GroupPollOptionView {
    id: number;
    label: string;
    position: number;
    votesCount: number;
    votedByMe: boolean;
}

export interface GroupPollView {
    id: number;
    title: string;
    description: string | null;
    allowsMultiple: boolean;
    isAnonymous: boolean;
    showResults: boolean;
    status: "open" | "closed";
    closesAt: string | null;
    options: GroupPollOptionView[];
}

export interface GroupChannelView {
    id: number;
    name: string;
    type: string;
    description: string | null;
}

export interface GroupMessageView {
    id: number;
    content: string | null;
    type: string;
    isImportant: boolean;
    createdAt: string | null;
    user: GroupUserView | null;
}

export interface GroupFileView {
    id: number;
    originalName: string;
    size: number;
    mimeType: string | null;
    createdAt: string | null;
    groupSubject: { id: number; name: string; color: string | null } | null;
}

export interface GroupPermissions {
    invite: boolean;
    edit: boolean;
    manageSubjects: boolean;
    manageSchedule: boolean;
    manageDeadlines: boolean;
    manageFiles: boolean;
    postAnnouncements: boolean;
    createPolls: boolean;
}

export interface GroupUniversityFormValue {
    institutionName: string;
    institutionShortName: string;
    facultyName: string;
    specialtyName: string;
    course: string;
    studyYear: string;
}

export interface GroupCounts {
    subjects: number;
    schedule: number;
    deadlines: number;
    files: number;
    announcements: number;
    polls: number;
    invites: number;
    members: number;
    chat: number;
}

export const ROLE_LABELS: Record<GroupRole, string> = {
    owner: "Власник",
    moderator: "Модератор",
    headman: "Староста",
    student: "Студент",
};

export const JOIN_POLICY_LABELS: Record<GroupView["joinPolicy"], string> = {
    invite_only: "Лише за інвайтом",
    invite_or_request: "Інвайт або запит",
    code_or_request: "Код групи або запит",
};
