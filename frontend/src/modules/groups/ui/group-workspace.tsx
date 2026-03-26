import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
    CalendarDaysIcon,
    CheckCheckIcon,
    FileUpIcon,
    FolderPlusIcon,
    Loader2Icon,
    MegaphoneIcon,
    MessageSquareIcon,
    PlusIcon,
    Settings2Icon,
    ShieldCheckIcon,
    VoteIcon,
} from "lucide-react";
import {
    useAcknowledgeGroupAnnouncement,
    useCreateGroupAnnouncement,
    useCreateGroupChannelMessage,
    useCreateGroupDeadline,
    useCreateGroupFile,
    useCreateGroupFolder,
    useCreateGroupLesson,
    useCreateGroupPoll,
    useCreateGroupSubject,
    useGroup,
    useGroupAnnouncements,
    useGroupChannelMessages,
    useGroupChannels,
    useGroupDeadlines,
    useGroupInvites,
    useGroupJoinRequests,
    useGroupMembers,
    useGroupOverview,
    useGroupPolls,
    useGroupRecentFiles,
    useGroupSchedule,
    useGroupSubjects,
    useRespondToGroupJoinRequest,
    useUpdateGroup,
    useUpdateGroupDeadlineProgress,
    useVoteGroupPoll,
} from "@/modules/groups/api/hooks";
import type { GroupSection } from "@/modules/groups/ui/groups-sidebar";
import {
    DEFAULT_GROUP_SECTION,
    GROUP_SECTION_LABELS,
    GroupsSidebar,
} from "@/modules/groups/ui/groups-sidebar";
import { useAuthUser } from "@/modules/auth/model/useAuthUser";
import {
    useDeliveryModes,
    useLessonTypes,
    useRecurrenceRules,
} from "@/modules/schedule/api/hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { API_BASE_URL } from "@/app/config/app.config";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/shadcn/ui/card";
import { Separator } from "@/shared/shadcn/ui/separator";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { cn } from "@/shared/shadcn/lib/utils";
type GroupRole = "owner" | "moderator" | "headman" | "student";
interface GroupView {
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
    facultyName: string | null;
    specialtyName: string | null;
    course: number | null;
    studyYear: number | null;
}
interface GroupUserView {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    avatarPath: string | null;
}
interface GroupMemberView {
    id: number;
    userId: number;
    role: GroupRole;
    status: string;
    joinedAt: string | null;
    subgroup: string | null;
    user: GroupUserView | null;
}
interface GroupSubjectView {
    id: number;
    name: string;
    teacherName: string | null;
    color: string | null;
    description: string | null;
}
interface GroupScheduleItemView {
    id: number;
    lessonId: number | null;
    date: string;
    startsAt: string;
    endsAt: string | null;
    subject: GroupSubjectView;
    lessonTypeName: string | null;
    deliveryModeName: string | null;
    location: string | null;
    note: string | null;
}
interface GroupDeadlineView {
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
interface GroupAnnouncementView {
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
interface GroupInviteView {
    id: number;
    code: string;
    token: string;
    status: string;
    maxUses: number | null;
    usesCount: number;
    expiresAt: string | null;
    createdAt: string | null;
}
interface GroupJoinRequestView {
    id: number;
    message: string | null;
    status: string;
    createdAt: string | null;
    user: GroupUserView | null;
}
interface GroupPollOptionView {
    id: number;
    label: string;
    position: number;
    votesCount: number;
    votedByMe: boolean;
}
interface GroupPollView {
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
interface GroupChannelView {
    id: number;
    name: string;
    type: string;
    description: string | null;
}
interface GroupMessageView {
    id: number;
    content: string | null;
    type: string;
    isImportant: boolean;
    createdAt: string | null;
    user: GroupUserView | null;
}
interface GroupFileView {
    id: number;
    originalName: string;
    size: number;
    mimeType: string | null;
    createdAt: string | null;
    groupSubject: { id: number; name: string; color: string | null } | null;
}
interface PermissionSummary {
    key: string;
    label: string;
    requiredRole: GroupRole;
    allowed: boolean;
}
const ROLE_LABELS: Record<GroupRole, string> = {
    owner: "Власник",
    moderator: "Модератор",
    headman: "Староста",
    student: "Студент",
};
const JOIN_POLICY_LABELS: Record<GroupView["joinPolicy"], string> = {
    invite_only: "Лише за інвайтом",
    invite_or_request: "Інвайт або запит",
    code_or_request: "Код групи або запит",
};
const PRIORITY_LABELS: Record<string, string> = {
    low: "Низький",
    medium: "Середній",
    high: "Високий",
    critical: "Критичний",
};
const WEEKDAY_OPTIONS = [
    { value: 1, label: "Понеділок" },
    { value: 2, label: "Вівторок" },
    { value: 3, label: "Середа" },
    { value: 4, label: "Четвер" },
    { value: 5, label: "П’ятниця" },
    { value: 6, label: "Субота" },
    { value: 7, label: "Неділя" },
];
const sectionOrder: GroupSection[] = [
    "overview",
    "subjects",
    "schedule",
    "deadlines",
    "files",
    "announcements",
    "chat",
    "polls",
    "members",
    "settings",
];
const inputClassName =
    "h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const textareaClassName =
    "min-h-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
const selectClassName =
    "h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
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
function normalizeUser(raw: unknown): GroupUserView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        firstName: read<string>(raw, "firstName", "first_name") ?? "Користувач",
        lastName: read<string | null>(raw, "lastName", "last_name") ?? null,
        username: read<string>(raw, "username") ?? "",
        avatarPath: read<string | null>(raw, "avatarPath", "avatar_path") ?? null,
    };
}
function normalizeGroup(raw: unknown): GroupView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        name: read<string>(raw, "name") ?? "Група",
        code: read<string>(raw, "code") ?? "—",
        description: read<string | null>(raw, "description") ?? null,
        color: read<string | null>(raw, "color") ?? null,
        visibility: (read<"private" | "public">(raw, "visibility") ?? "private"),
        joinPolicy: (
            read<GroupView["joinPolicy"]>(raw, "joinPolicy", "join_policy") ??
            "invite_or_request"
        ),
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
            read<GroupRole>(raw, "postAnnouncementsRole", "post_announcements_role") ?? "headman",
        createPollsRole:
            read<GroupRole>(raw, "createPollsRole", "create_polls_role") ?? "headman",
        institutionName:
            read<string | null>(raw, "institutionName", "institution_name") ?? null,
        facultyName: read<string | null>(raw, "facultyName", "faculty_name") ?? null,
        specialtyName:
            read<string | null>(raw, "specialtyName", "specialty_name") ?? null,
        course: read<number | null>(raw, "course") ?? null,
        studyYear: read<number | null>(raw, "studyYear", "study_year") ?? null,
    };
}
function normalizeMember(raw: unknown): GroupMemberView | null {
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
function normalizeSubject(raw: unknown): GroupSubjectView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        name: read<string>(raw, "name") ?? "Предмет",
        teacherName: read<string | null>(raw, "teacherName", "teacher_name") ?? null,
        color: read<string | null>(raw, "color") ?? null,
        description: read<string | null>(raw, "description") ?? null,
    };
}
function normalizeScheduleItem(raw: unknown): GroupScheduleItemView | null {
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
        lessonTypeName: lessonType?.name as string | null,
        deliveryModeName: deliveryMode?.name as string | null,
        location: read<string | null>(raw, "location") ?? null,
        note: read<string | null>(raw, "note") ?? null,
    };
}
function normalizeDeadline(raw: unknown): GroupDeadlineView | null {
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
                    (read<"not_started" | "in_progress" | "completed">(
                        myStatusRaw,
                        "status",
                    ) ?? "not_started"),
                completedAt:
                    read<string | null>(myStatusRaw, "completedAt", "completed_at") ?? null,
            }
            : null,
    };
}
function normalizeAnnouncement(raw: unknown): GroupAnnouncementView | null {
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
function normalizeInvite(raw: unknown): GroupInviteView | null {
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
function normalizeJoinRequest(raw: unknown): GroupJoinRequestView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        message: read<string | null>(raw, "message") ?? null,
        status: read<string>(raw, "status") ?? "pending",
        createdAt: read<string | null>(raw, "createdAt", "created_at") ?? null,
        user: normalizeUser(read<unknown>(raw, "user")),
    };
}
function normalizePoll(raw: unknown): GroupPollView | null {
    if (!raw || typeof raw !== "object") return null;
    const optionsRaw = read<unknown[]>(raw, "options") ?? [];
    return {
        id: read<number>(raw, "id") ?? 0,
        title: read<string>(raw, "title") ?? "Опитування",
        description: read<string | null>(raw, "description") ?? null,
        allowsMultiple:
            read<boolean>(raw, "allowsMultiple", "allows_multiple") ?? false,
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
function normalizeChannel(raw: unknown): GroupChannelView | null {
    if (!raw || typeof raw !== "object") return null;
    return {
        id: read<number>(raw, "id") ?? 0,
        name: read<string>(raw, "name") ?? "Канал",
        type: read<string>(raw, "type") ?? "custom",
        description: read<string | null>(raw, "description") ?? null,
    };
}
function normalizeMessage(raw: unknown): GroupMessageView | null {
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
function normalizeFile(raw: unknown): GroupFileView | null {
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
function roleAllows(currentRole: GroupRole | null, requiredRole: GroupRole): boolean {
    if (!currentRole) return false;
    const ranks: Record<GroupRole, number> = {
        owner: 400,
        moderator: 300,
        headman: 200,
        student: 100,
    };
    return ranks[currentRole] >= ranks[requiredRole];
}
function formatDateTime(value: string | null | undefined) {
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
function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}
function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
function toDateInputValue(date: Date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}
function toDateTimeInputValue(date: Date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}
function SectionHeader({
                           eyebrow,
                           title,
                           description,
                           actions,
                       }: {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        {eyebrow}
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h2>
                    <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
        </div>
    );
}
function StatCard({
                      label,
                      value,
                      hint,
                  }: {
    label: string;
    value: string | number;
    hint: string;
}) {
    return (
        <Card className="border-border/70">
            <CardContent className="space-y-2 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                </div>
                <div className="text-2xl font-semibold text-foreground">{value}</div>
                <p className="text-sm text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    );
}
function Field({
                   label,
                   children,
                   hint,
               }: {
    label: string;
    children: ReactNode;
    hint?: string;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {children}
            {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </label>
    );
}
function EmptyState({
                        title,
                        description,
                    }: {
    title: string;
    description: string;
}) {
    return (
        <Card className="border-dashed border-border/80 bg-muted/20">
            <CardContent className="py-10 text-center">
                <div className="text-base font-semibold text-foreground">{title}</div>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
function AccessNotice({
                          allowed,
                          requiredRole,
                          allowedLabel = "Дія доступна для вашої ролі.",
                      }: {
    allowed: boolean;
    requiredRole: GroupRole;
    allowedLabel?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border px-3 py-3 text-sm",
                allowed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
        >
            {allowed
                ? allowedLabel
                : `Потрібна роль не нижче "${ROLE_LABELS[requiredRole]}".`}
        </div>
    );
}
export function GroupWorkspace({ groupId }: { groupId: number }) {
    const user = useAuthUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const sectionParam = searchParams.get("section") as GroupSection | null;
    const currentSection =
        sectionParam && sectionOrder.includes(sectionParam)
            ? sectionParam
            : DEFAULT_GROUP_SECTION;
    const from = useMemo(() => toDateInputValue(new Date()), []);
    const to = useMemo(() => toDateInputValue(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)), []);
    const groupQuery = useGroup(groupId);
    const overviewQuery = useGroupOverview(groupId);
    const membersQuery = useGroupMembers(groupId);
    const subjectsQuery = useGroupSubjects(groupId);
    const scheduleQuery = useGroupSchedule(groupId, from, to);
    const deadlinesQuery = useGroupDeadlines(groupId);
    const filesQuery = useGroupRecentFiles(groupId);
    const announcementsQuery = useGroupAnnouncements(groupId);
    const pollsQuery = useGroupPolls(groupId);
    const channelsQuery = useGroupChannels(groupId);
    const invitesQuery = useGroupInvites(groupId);
    const joinRequestsQuery = useGroupJoinRequests(groupId);
    const group = useMemo(() => normalizeGroup(groupQuery.data), [groupQuery.data]);
    const overviewGroup = useMemo(
        () => normalizeGroup(read<unknown>(overviewQuery.data, "group")),
        [overviewQuery.data],
    );
    const resolvedGroup = group ?? overviewGroup;
    const members = useMemo(
        () =>
            (membersQuery.data ?? [])
                .map((item) => normalizeMember(item))
                .filter((item): item is GroupMemberView => item !== null),
        [membersQuery.data],
    );
    const subjects = useMemo(
        () =>
            (subjectsQuery.data ?? [])
                .map((item) => normalizeSubject(item))
                .filter((item): item is GroupSubjectView => item !== null),
        [subjectsQuery.data],
    );
    const scheduleItems = useMemo(
        () =>
            (scheduleQuery.data ?? [])
                .map((item) => normalizeScheduleItem(item))
                .filter((item): item is GroupScheduleItemView => item !== null),
        [scheduleQuery.data],
    );
    const deadlines = useMemo(
        () =>
            (deadlinesQuery.data ?? [])
                .map((item) => normalizeDeadline(item))
                .filter((item): item is GroupDeadlineView => item !== null),
        [deadlinesQuery.data],
    );
    const files = useMemo(
        () =>
            (filesQuery.data ?? [])
                .map((item) => normalizeFile(item))
                .filter((item): item is GroupFileView => item !== null),
        [filesQuery.data],
    );
    const announcements = useMemo(
        () =>
            (announcementsQuery.data ?? [])
                .map((item) => normalizeAnnouncement(item))
                .filter((item): item is GroupAnnouncementView => item !== null),
        [announcementsQuery.data],
    );
    const polls = useMemo(
        () =>
            (pollsQuery.data ?? [])
                .map((item) => normalizePoll(item))
                .filter((item): item is GroupPollView => item !== null),
        [pollsQuery.data],
    );
    const channels = useMemo(
        () =>
            (channelsQuery.data ?? [])
                .map((item) => normalizeChannel(item))
                .filter((item): item is GroupChannelView => item !== null),
        [channelsQuery.data],
    );
    const invites = useMemo(
        () =>
            (invitesQuery.data ?? [])
                .map((item) => normalizeInvite(item))
                .filter((item): item is GroupInviteView => item !== null),
        [invitesQuery.data],
    );
    const joinRequests = useMemo(
        () =>
            (joinRequestsQuery.data ?? [])
                .map((item) => normalizeJoinRequest(item))
                .filter((item): item is GroupJoinRequestView => item !== null),
        [joinRequestsQuery.data],
    );
    const membership =
        members.find((member) => member.userId === user?.id && member.status === "active") ?? null;
    const currentRole = membership?.role ?? null;
    const permissions = useMemo(() => {
        if (!resolvedGroup) {
            return {
                invite: false,
                edit: false,
                manageSubjects: false,
                manageSchedule: false,
                manageDeadlines: false,
                manageFiles: false,
                postAnnouncements: false,
                createPolls: false,
            };
        }
        return {
            invite: roleAllows(currentRole, resolvedGroup.inviteRole),
            edit: roleAllows(currentRole, resolvedGroup.editRole),
            manageSubjects: roleAllows(currentRole, resolvedGroup.manageSubjectsRole),
            manageSchedule: roleAllows(currentRole, resolvedGroup.manageScheduleRole),
            manageDeadlines: roleAllows(currentRole, resolvedGroup.manageDeadlinesRole),
            manageFiles: roleAllows(currentRole, resolvedGroup.manageFilesRole),
            postAnnouncements: roleAllows(currentRole, resolvedGroup.postAnnouncementsRole),
            createPolls: roleAllows(currentRole, resolvedGroup.createPollsRole),
        };
    }, [currentRole, resolvedGroup]);
    const permissionRows = useMemo<PermissionSummary[]>(() => {
        if (!resolvedGroup) return [];
        return [
            {
                key: "subjects",
                label: "Додавати предмети",
                requiredRole: resolvedGroup.manageSubjectsRole,
                allowed: permissions.manageSubjects,
            },
            {
                key: "schedule",
                label: "Редагувати розклад",
                requiredRole: resolvedGroup.manageScheduleRole,
                allowed: permissions.manageSchedule,
            },
            {
                key: "deadlines",
                label: "Створювати дедлайни",
                requiredRole: resolvedGroup.manageDeadlinesRole,
                allowed: permissions.manageDeadlines,
            },
            {
                key: "files",
                label: "Завантажувати файли",
                requiredRole: resolvedGroup.manageFilesRole,
                allowed: permissions.manageFiles,
            },
            {
                key: "announcements",
                label: "Публікувати оголошення",
                requiredRole: resolvedGroup.postAnnouncementsRole,
                allowed: permissions.postAnnouncements,
            },
            {
                key: "polls",
                label: "Створювати опитування",
                requiredRole: resolvedGroup.createPollsRole,
                allowed: permissions.createPolls,
            },
            {
                key: "invites",
                label: "Створювати інвайти",
                requiredRole: resolvedGroup.inviteRole,
                allowed: permissions.invite,
            },
            {
                key: "settings",
                label: "Змінювати налаштування групи",
                requiredRole: resolvedGroup.editRole,
                allowed: permissions.edit,
            },
        ];
    }, [permissions, resolvedGroup]);
    const counts = useMemo(
        () => ({
            subjects: subjects.length,
            schedule: scheduleItems.length,
            deadlines: deadlines.length,
            files: files.length,
            announcements: announcements.length,
            polls: polls.length,
            invites: invites.length,
            members: members.filter((member) => member.status === "active").length,
            chat: channels.length,
        }),
        [
            announcements.length,
            channels.length,
            deadlines.length,
            files.length,
            invites.length,
            members,
            polls.length,
            scheduleItems.length,
            subjects.length,
        ],
    );
    const setSection = (section: GroupSection) => {
        const next = new URLSearchParams(searchParams);
        next.set("section", section);
        setSearchParams(next, { replace: true });
    };
    const selectedChannelId = useMemo(() => {
        const channelParam = Number(searchParams.get("channel"));
        if (Number.isFinite(channelParam) && channels.some((channel) => channel.id === channelParam)) {
            return channelParam;
        }
        return channels[0]?.id ?? null;
    }, [channels, searchParams]);
    useEffect(() => {
        if (!selectedChannelId || searchParams.get("channel")) return;
        const next = new URLSearchParams(searchParams);
        next.set("channel", String(selectedChannelId));
        setSearchParams(next, { replace: true });
    }, [searchParams, selectedChannelId, setSearchParams]);
    const activeChannel = channels.find((channel) => channel.id === selectedChannelId) ?? null;
    const messagesQuery = useGroupChannelMessages(groupId, selectedChannelId);
    const messages = useMemo(
        () =>
            (messagesQuery.data ?? [])
                .map((item) => normalizeMessage(item))
                .filter((item): item is GroupMessageView => item !== null),
        [messagesQuery.data],
    );
    const lessonTypesQuery = useLessonTypes();
    const deliveryModesQuery = useDeliveryModes();
    const recurrenceRulesQuery = useRecurrenceRules();
    const createSubject = useCreateGroupSubject();
    const createLesson = useCreateGroupLesson();
    const createDeadline = useCreateGroupDeadline();
    const updateDeadlineProgress = useUpdateGroupDeadlineProgress();
    const createFile = useCreateGroupFile();
    const createFolder = useCreateGroupFolder();
    const createAnnouncement = useCreateGroupAnnouncement();
    const acknowledgeAnnouncement = useAcknowledgeGroupAnnouncement();
    const createPoll = useCreateGroupPoll();
    const votePoll = useVoteGroupPoll();
    const respondJoinRequest = useRespondToGroupJoinRequest();
    const createMessage = useCreateGroupChannelMessage();
    const updateGroup = useUpdateGroup();
    const [subjectForm, setSubjectForm] = useState({
        name: "",
        teacherName: "",
        color: "#2563eb",
        description: "",
    });
    const [lessonForm, setLessonForm] = useState({
        groupSubjectId: "",
        weekday: "1",
        startsAt: "08:30",
        endsAt: "10:05",
        lessonTypeId: "",
        deliveryModeId: "",
        recurrenceRuleId: "",
        locationText: "",
        note: "",
        activeFrom: from,
        activeTo: "",
    });
    const [deadlineForm, setDeadlineForm] = useState({
        groupSubjectId: "",
        title: "",
        description: "",
        type: "homework",
        priority: "medium",
        dueAt: toDateTimeInputValue(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)),
    });
    const [fileSubjectId, setFileSubjectId] = useState("");
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [folderForm, setFolderForm] = useState({
        name: "",
        groupSubjectId: "",
    });
    const [announcementForm, setAnnouncementForm] = useState({
        title: "",
        content: "",
        type: "organizational",
        isPinned: false,
        requiresAcknowledgement: false,
        deadlineAt: "",
    });
    const [pollForm, setPollForm] = useState({
        title: "",
        description: "",
        allowsMultiple: false,
        isAnonymous: false,
        showResults: true,
        closesAt: "",
        optionsText: "Так\nНі",
    });
    const [pollSelections, setPollSelections] = useState<Record<number, number[]>>({});

    const [messageText, setMessageText] = useState("");
    const [settingsForm, setSettingsForm] = useState({
        name: "",
        code: "",
        description: "",
        color: "#2563eb",
        visibility: "private" as GroupView["visibility"],
        joinPolicy: "invite_or_request" as GroupView["joinPolicy"],
        inviteRole: "headman" as GroupRole,
        editRole: "moderator" as GroupRole,
        manageSubjectsRole: "headman" as GroupRole,
        manageScheduleRole: "headman" as GroupRole,
        manageDeadlinesRole: "headman" as GroupRole,
        manageFilesRole: "headman" as GroupRole,
        postAnnouncementsRole: "headman" as GroupRole,
        createPollsRole: "headman" as GroupRole,
    });
    useEffect(() => {
        if (!resolvedGroup) return;
        setSettingsForm({
            name: resolvedGroup.name,
            code: resolvedGroup.code,
            description: resolvedGroup.description ?? "",
            color: resolvedGroup.color ?? "#2563eb",
            visibility: resolvedGroup.visibility,
            joinPolicy: resolvedGroup.joinPolicy,
            inviteRole: resolvedGroup.inviteRole,
            editRole: resolvedGroup.editRole,
            manageSubjectsRole: resolvedGroup.manageSubjectsRole,
            manageScheduleRole: resolvedGroup.manageScheduleRole,
            manageDeadlinesRole: resolvedGroup.manageDeadlinesRole,
            manageFilesRole: resolvedGroup.manageFilesRole,
            postAnnouncementsRole: resolvedGroup.postAnnouncementsRole,
            createPollsRole: resolvedGroup.createPollsRole,
        });
    }, [resolvedGroup]);
    async function handleCreateSubject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await createSubject.mutateAsync({
            groupId,
            payload: {
                name: subjectForm.name.trim(),
                teacherName: subjectForm.teacherName.trim() || undefined,
                color: subjectForm.color,
                description: subjectForm.description.trim() || undefined,
            },
        });
        setSubjectForm({
            name: "",
            teacherName: "",
            color: "#2563eb",
            description: "",
        });
    }
    async function handleCreateLesson(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await createLesson.mutateAsync({
            groupId,
            payload: {
                groupSubjectId: Number(lessonForm.groupSubjectId),
                weekday: Number(lessonForm.weekday),
                startsAt: lessonForm.startsAt,
                endsAt: lessonForm.endsAt,
                lessonTypeId: Number(lessonForm.lessonTypeId),
                deliveryModeId: Number(lessonForm.deliveryModeId),
                recurrenceRuleId: Number(lessonForm.recurrenceRuleId),
                locationText: lessonForm.locationText.trim() || undefined,
                note: lessonForm.note.trim() || undefined,
                activeFrom: lessonForm.activeFrom,
                activeTo: lessonForm.activeTo || undefined,
            },
        });
        setLessonForm((current) => ({
            ...current,
            note: "",
            locationText: "",
        }));
    }
    async function handleCreateDeadline(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await createDeadline.mutateAsync({
            groupId,
            payload: {
                groupSubjectId: deadlineForm.groupSubjectId
                    ? Number(deadlineForm.groupSubjectId)
                    : undefined,
                title: deadlineForm.title.trim(),
                description: deadlineForm.description.trim() || undefined,
                type: deadlineForm.type,
                priority: deadlineForm.priority,
                dueAt: deadlineForm.dueAt,
            },
        });
        setDeadlineForm({
            groupSubjectId: "",
            title: "",
            description: "",
            type: "homework",
            priority: "medium",
            dueAt: toDateTimeInputValue(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)),
        });
    }
    async function handleUploadFile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!fileToUpload) return;
        const payload = new FormData();
        payload.append("file", fileToUpload);
        if (fileSubjectId) {
            payload.append("group_subject_id", fileSubjectId);
        }
        await createFile.mutateAsync({ groupId, payload });
        setFileToUpload(null);
        setFileSubjectId("");
    }
    async function handleCreateFolder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await createFolder.mutateAsync({
            groupId,
            payload: {
                name: folderForm.name.trim(),
                groupSubjectId: folderForm.groupSubjectId
                    ? Number(folderForm.groupSubjectId)
                    : undefined,
            },
        });
        setFolderForm({ name: "", groupSubjectId: "" });
    }
    async function handleCreateAnnouncement(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await createAnnouncement.mutateAsync({
            groupId,
            payload: {
                title: announcementForm.title.trim(),
                content: announcementForm.content.trim(),
                type: announcementForm.type,
                isPinned: announcementForm.isPinned,
                requiresAcknowledgement: announcementForm.requiresAcknowledgement,
                deadlineAt: announcementForm.deadlineAt || undefined,
            },
        });
        setAnnouncementForm({
            title: "",
            content: "",
            type: "organizational",
            isPinned: false,
            requiresAcknowledgement: false,
            deadlineAt: "",
        });
    }
    async function handleCreatePoll(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = pollForm.optionsText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((label, index) => ({ label, position: index }));
        await createPoll.mutateAsync({
            groupId,
            payload: {
                title: pollForm.title.trim(),
                description: pollForm.description.trim() || undefined,
                allowsMultiple: pollForm.allowsMultiple,
                isAnonymous: pollForm.isAnonymous,
                showResults: pollForm.showResults,
                closesAt: pollForm.closesAt || undefined,
                options,
            },
        });
        setPollForm({
            title: "",
            description: "",
            allowsMultiple: false,
            isAnonymous: false,
            showResults: true,
            closesAt: "",
            optionsText: "Так\nНі",
        });
    }
    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedChannelId || !messageText.trim()) return;
        await createMessage.mutateAsync({
            groupId,
            channelId: selectedChannelId,
            payload: {
                content: messageText.trim(),
                type: "text",
            },
        });
        setMessageText("");
    }
    async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await updateGroup.mutateAsync({
            groupId,
            payload: {
                name: settingsForm.name.trim(),
                code: settingsForm.code.trim().toUpperCase(),
                description: settingsForm.description.trim() || undefined,
                color: settingsForm.color,
                visibility: settingsForm.visibility,
                joinPolicy: settingsForm.joinPolicy,
                inviteRole: settingsForm.inviteRole,
                editRole: settingsForm.editRole,
                manageSubjectsRole: settingsForm.manageSubjectsRole,
                manageScheduleRole: settingsForm.manageScheduleRole,
                manageDeadlinesRole: settingsForm.manageDeadlinesRole,
                manageFilesRole: settingsForm.manageFilesRole,
                postAnnouncementsRole: settingsForm.postAnnouncementsRole,
                createPollsRole: settingsForm.createPollsRole,
            },
        });
    }
    if (groupQuery.isLoading || !resolvedGroup) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 rounded-3xl" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-32 rounded-3xl" />
                    ))}
                </div>
                <Skeleton className="h-72 rounded-3xl" />
            </div>
        );
    }
    const renderOverview = () => (
        <div className="space-y-6 px-4 py-6 md:px-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Учасники"
                    value={resolvedGroup.membersCount || counts.members}
                    hint="Активні учасники робочого простору"
                />
                <StatCard
                    label="Предмети"
                    value={counts.subjects}
                    hint="Почніть саме з них, щоб підв’язати все інше"
                />
                <StatCard
                    label="Дедлайни"
                    value={counts.deadlines}
                    hint="Завдання і контрольні точки групи"
                />
                <StatCard
                    label="Файли"
                    value={counts.files}
                    hint="Останні завантажені матеріали"
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Як користуватись групою</CardTitle>
                    <CardDescription>
                        Те, чого зараз бракувало в UI: послідовність і видимість ролей.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="text-sm font-semibold text-foreground">Рекомендований порядок</div>
                        <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                            <li>1. Налаштуйте групу і ролі в секції "Налаштування".</li>
                            <li>2. Додайте предмети, щоб мати прив’язку для розкладу, файлів і дедлайнів.</li>
                            <li>3. Заповніть розклад, дедлайни та матеріали.</li>
                            <li>4. Лише після цього створюйте інвайти і запрошуйте учасників.</li>
                        </ol>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="text-sm font-semibold text-foreground">Поточна причина, чому "нічого не можна"</div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Дії в групі залежать від ролі. За замовчуванням більшість керуючих
                            дій доступні від ролі "{ROLE_LABELS[resolvedGroup.manageSubjectsRole]}"
                            або вище. Якщо ви звичайний учасник, то можете переглядати контент,
                            відмічати власний прогрес по дедлайнах, читати чат, оголошення й
                            голосувати в опитуваннях, але не додавати структуру групи.
                        </p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ваші права в цій групі</CardTitle>
                    <CardDescription>
                        Поточна роль: {currentRole ? ROLE_LABELS[currentRole] : "Немає доступу"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                    {permissionRows.map((permission) => (
                        <div
                            key={permission.key}
                            className="rounded-2xl border border-border/70 bg-background px-4 py-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-foreground">
                                    {permission.label}
                                </div>
                                <Badge variant={permission.allowed ? "default" : "secondary"}>
                                    {permission.allowed ? "Можна" : ROLE_LABELS[permission.requiredRole]}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Найближчий розклад</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {scheduleItems.slice(0, 6).length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Розклад ще не додано.
                            </p>
                        ) : (
                            scheduleItems.slice(0, 6).map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-border/70 px-4 py-3"
                                >
                                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {item.subject.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(item.date)} · {item.startsAt}
                                                {item.endsAt ? ` – ${item.endsAt}` : ""}
                                            </div>
                                        </div>
                                        {item.location ? (
                                            <Badge variant="outline">{item.location}</Badge>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Швидкий контекст</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        {resolvedGroup.institutionName ? (
                            <div>
                                <div className="font-medium text-foreground">Заклад</div>
                                <div>{resolvedGroup.institutionName}</div>
                            </div>
                        ) : null}
                        {resolvedGroup.specialtyName ? (
                            <div>
                                <div className="font-medium text-foreground">Спеціальність</div>
                                <div>{resolvedGroup.specialtyName}</div>
                            </div>
                        ) : null}
                        {resolvedGroup.course ? (
                            <div>
                                <div className="font-medium text-foreground">Курс</div>
                                <div>{resolvedGroup.course}</div>
                            </div>
                        ) : null}
                        <div>
                            <div className="font-medium text-foreground">Політика вступу</div>
                            <div>{JOIN_POLICY_LABELS[resolvedGroup.joinPolicy]}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    const renderSubjects = () => (
        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.manageSubjects}
                requiredRole={resolvedGroup.manageSubjectsRole}
            />
            {permissions.manageSubjects ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Додати предмет</CardTitle>
                        <CardDescription>
                            Це перший крок. Без предметів важко нормально зв’язати розклад, файли й дедлайни.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubject}>
                            <Field label="Назва">
                                <input
                                    required
                                    className={inputClassName}
                                    value={subjectForm.name}
                                    onChange={(event) =>
                                        setSubjectForm((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Викладач">
                                <input
                                    className={inputClassName}
                                    value={subjectForm.teacherName}
                                    onChange={(event) =>
                                        setSubjectForm((current) => ({
                                            ...current,
                                            teacherName: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Колір">
                                <input
                                    type="color"
                                    className="h-10 w-24 rounded-xl border border-border bg-background p-1"
                                    value={subjectForm.color}
                                    onChange={(event) =>
                                        setSubjectForm((current) => ({
                                            ...current,
                                            color: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Опис">
<textarea
    className={textareaClassName}
    value={subjectForm.description}
    onChange={(event) =>
        setSubjectForm((current) => ({
            ...current,
            description: event.target.value,
        }))
    }
/>
                            </Field>
                            <div className="md:col-span-2">
                                <Button disabled={createSubject.isPending} type="submit">
                                    {createSubject.isPending ? (
                                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <PlusIcon className="mr-2 size-4" />
                                    )}
                                    Додати предмет
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}
            {subjects.length === 0 ? (
                <EmptyState
                    title="Предметів ще немає"
                    description="Додайте хоча б один предмет, і тоді з’явиться логічна основа для розкладу, файлів та дедлайнів."
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {subjects.map((subject) => (
                        <Card key={subject.id}>
                            <CardContent className="space-y-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {subject.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {subject.teacherName || "Викладача не вказано"}
                                        </div>
                                    </div>
                                    <span
                                        className="size-3 rounded-full"
                                        style={{ backgroundColor: subject.color ?? "#2563eb" }}
                                    />
                                </div>
                                {subject.description ? (
                                    <p className="text-sm text-muted-foreground">
                                        {subject.description}
                                    </p>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
    const renderSchedule = () => (
        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.manageSchedule}
                requiredRole={resolvedGroup.manageScheduleRole}
            />
            {subjects.length === 0 ? (
                <EmptyState
                    title="Спочатку додайте предмет"
                    description="Розклад у групі створюється на основі предметів. Без цього форма створення не має сенсу."
                />
            ) : null}
            {permissions.manageSchedule && subjects.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Додати пару до розкладу</CardTitle>
                        <CardDescription>
                            Налаштування регулярної пари для всієї групи.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleCreateLesson}>
                            <Field label="Предмет">
                                <select
                                    required
                                    className={selectClassName}
                                    value={lessonForm.groupSubjectId}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            groupSubjectId: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Оберіть предмет</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="День тижня">
                                <select
                                    className={selectClassName}
                                    value={lessonForm.weekday}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            weekday: event.target.value,
                                        }))
                                    }
                                >
                                    {WEEKDAY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Тип заняття">
                                <select
                                    required
                                    className={selectClassName}
                                    value={lessonForm.lessonTypeId}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            lessonTypeId: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Оберіть тип</option>
                                    {(lessonTypesQuery.data ?? []).map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Початок">
                                <input
                                    required
                                    type="time"
                                    className={inputClassName}
                                    value={lessonForm.startsAt}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            startsAt: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Кінець">
                                <input
                                    required
                                    type="time"
                                    className={inputClassName}
                                    value={lessonForm.endsAt}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            endsAt: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Формат">
                                <select
                                    required
                                    className={selectClassName}
                                    value={lessonForm.deliveryModeId}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            deliveryModeId: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Оберіть формат</option>
                                    {(deliveryModesQuery.data ?? []).map((mode) => (
                                        <option key={mode.id} value={mode.id}>
                                            {mode.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Повторення">
                                <select
                                    required
                                    className={selectClassName}
                                    value={lessonForm.recurrenceRuleId}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            recurrenceRuleId: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Оберіть правило</option>
                                    {(recurrenceRulesQuery.data ?? []).map((rule) => (
                                        <option key={rule.id} value={rule.id}>
                                            {rule.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Аудиторія / посилання">
                                <input
                                    className={inputClassName}
                                    value={lessonForm.locationText}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            locationText: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Активний з">
                                <input
                                    required
                                    type="date"
                                    className={inputClassName}
                                    value={lessonForm.activeFrom}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            activeFrom: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Активний до">
                                <input
                                    type="date"
                                    className={inputClassName}
                                    value={lessonForm.activeTo}
                                    onChange={(event) =>
                                        setLessonForm((current) => ({
                                            ...current,
                                            activeTo: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <div className="md:col-span-2 xl:col-span-3">
                                <Field label="Нотатка">
<textarea
    className={textareaClassName}
    value={lessonForm.note}
    onChange={(event) =>
        setLessonForm((current) => ({
            ...current,
            note: event.target.value,
        }))
    }
/>
                                </Field>
                            </div>
                            <div className="md:col-span-2 xl:col-span-3">
                                <Button
                                    type="submit"
                                    disabled={
                                        createLesson.isPending ||
                                        !lessonForm.groupSubjectId ||
                                        !lessonForm.lessonTypeId ||
                                        !lessonForm.deliveryModeId ||
                                        !lessonForm.recurrenceRuleId
                                    }
                                >
                                    {createLesson.isPending ? (
                                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <CalendarDaysIcon className="mr-2 size-4" />
                                    )}
                                    Додати до розкладу
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}
            {scheduleItems.length === 0 ? (
                <EmptyState
                    title="Розклад ще порожній"
                    description="Після додавання предметів і регулярних пар ця секція стане основою для всієї групи."
                />
            ) : (
                <div className="space-y-3">
                    {scheduleItems.map((item) => (
                        <Card key={`${item.id}-${item.date}`}>
                            <CardContent className="space-y-2 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {item.subject.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(item.date)} · {item.startsAt}
                                            {item.endsAt ? ` – ${item.endsAt}` : ""}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.lessonTypeName ? (
                                            <Badge variant="outline">{item.lessonTypeName}</Badge>
                                        ) : null}
                                        {item.deliveryModeName ? (
                                            <Badge variant="secondary">{item.deliveryModeName}</Badge>
                                        ) : null}
                                    </div>
                                </div>
                                {item.location || item.note ? <Separator /> : null}
                                {item.location ? (
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">Локація:</span>{" "}
                                        {item.location}
                                    </p>
                                ) : null}
                                {item.note ? (
                                    <p className="text-sm text-muted-foreground">{item.note}</p>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
    const renderDeadlines = () => (
        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.manageDeadlines}
                requiredRole={resolvedGroup.manageDeadlinesRole}
                allowedLabel="Ви можете створювати дедлайни для всієї групи. Учасники нижчих ролей все одно можуть відмічати власний прогрес."
            />
            {permissions.manageDeadlines ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Новий дедлайн</CardTitle>
                        <CardDescription>
                            Можна прив’язати до предмета, але це не обов’язково.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleCreateDeadline}>
                            <Field label="Предмет">
                                <select
                                    className={selectClassName}
                                    value={deadlineForm.groupSubjectId}
                                    onChange={(event) =>
                                        setDeadlineForm((current) => ({
                                            ...current,
                                            groupSubjectId: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Без предмета</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Тип">
                                <input
                                    className={inputClassName}
                                    value={deadlineForm.type}
                                    onChange={(event) =>
                                        setDeadlineForm((current) => ({
                                            ...current,
                                            type: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <Field label="Пріоритет">
                                <select
                                    className={selectClassName}
                                    value={deadlineForm.priority}
                                    onChange={(event) =>
                                        setDeadlineForm((current) => ({
                                            ...current,
                                            priority: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="low">Низький</option>
                                    <option value="medium">Середній</option>
                                    <option value="high">Високий</option>
                                    <option value="critical">Критичний</option>
                                </select>
                            </Field>
                            <div className="md:col-span-2 xl:col-span-2">
                                <Field label="Назва">
                                    <input
                                        required
                                        className={inputClassName}
                                        value={deadlineForm.title}
                                        onChange={(event) =>
                                            setDeadlineForm((current) => ({
                                                ...current,
                                                title: event.target.value,
                                            }))
                                        }
                                    />
                                </Field>
                            </div>
                            <Field label="Термін">
                                <input
                                    required
                                    type="datetime-local"
                                    className={inputClassName}
                                    value={deadlineForm.dueAt}
                                    onChange={(event) =>
                                        setDeadlineForm((current) => ({
                                            ...current,
                                            dueAt: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <div className="md:col-span-2 xl:col-span-3">
                                <Field label="Опис">
<textarea
    className={textareaClassName}
    value={deadlineForm.description}
    onChange={(event) =>
        setDeadlineForm((current) => ({
            ...current,
            description: event.target.value,
        }))
    }
/>
                                </Field>
                            </div>
                            <div className="md:col-span-2 xl:col-span-3">
                                <Button
                                    type="submit"
                                    disabled={createDeadline.isPending || !deadlineForm.title.trim()}
                                >
                                    {createDeadline.isPending ? (
                                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ShieldCheckIcon className="mr-2 size-4" />
                                    )}
                                    Додати дедлайн
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}
            {deadlines.length === 0 ? (
                <EmptyState
                    title="Дедлайнів ще немає"
                    description="Після створення вони стануть видимими для всіх учасників, а кожен зможе відмічати власний прогрес."
                />
            ) : (
                <div className="space-y-3">
                    {deadlines.map((deadline) => (
                        <Card key={deadline.id}>
                            <CardContent className="space-y-3 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1">
                                        <div className="font-medium text-foreground">
                                            {deadline.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {deadline.subject?.name ? `${deadline.subject.name} · ` : ""}
                                            {formatDateTime(deadline.dueAt)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                            {PRIORITY_LABELS[deadline.priority] ?? deadline.priority}
                                        </Badge>
                                        <Badge variant="secondary">{deadline.type}</Badge>
                                    </div>
                                </div>
                                {deadline.description ? (
                                    <p className="text-sm text-muted-foreground">
                                        {deadline.description}
                                    </p>
                                ) : null}
                                <div className="flex flex-wrap gap-2">
                                    {(["not_started", "in_progress", "completed"] as const).map((status) => (
                                        <Button
                                            key={status}
                                            type="button"
                                            variant={
                                                deadline.myStatus?.status === status
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            disabled={
                                                updateDeadlineProgress.isPending &&
                                                updateDeadlineProgress.variables?.deadlineId === deadline.id
                                            }
                                            onClick={() =>
                                                updateDeadlineProgress.mutate({
                                                    groupId,
                                                    deadlineId: deadline.id,
                                                    status,
                                                })
                                            }
                                        >
                                            {status === "not_started"
                                                ? "Не почав"
                                                : status === "in_progress"
                                                    ? "В процесі"
                                                    : "Виконано"}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
    const renderFiles = () => (
        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.manageFiles}
                requiredRole={resolvedGroup.manageFilesRole}
            />
            {permissions.manageFiles ? (
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Завантажити файл</CardTitle>
                            <CardDescription>
                                Найпростіший сценарій: вибрати файл і, за потреби, вказати предмет.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4" onSubmit={handleUploadFile}>
                                <Field label="Файл">
                                    <input
                                        required
                                        type="file"
                                        className={inputClassName}
                                        onChange={(event) =>
                                            setFileToUpload(event.target.files?.[0] ?? null)
                                        }
                                    />
                                </Field>
                                <Field label="Предмет">
                                    <select
                                        className={selectClassName}
                                        value={fileSubjectId}
                                        onChange={(event) => setFileSubjectId(event.target.value)}
                                    >
                                        <option value="">Без предмета</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <div>
                                    <Button
                                        type="submit"
                                        disabled={createFile.isPending || !fileToUpload}
                                    >
                                        {createFile.isPending ? (
                                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <FileUpIcon className="mr-2 size-4" />
                                        )}
                                        Завантажити
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Створити папку</CardTitle>
                            <CardDescription>
                                Якщо хочете структурувати матеріали в межах групи.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4" onSubmit={handleCreateFolder}>
                                <Field label="Назва папки">
                                    <input
                                        required
                                        className={inputClassName}
                                        value={folderForm.name}
                                        onChange={(event) =>
                                            setFolderForm((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                    />
                                </Field>
                                <Field label="Предмет">
                                    <select
                                        className={selectClassName}
                                        value={folderForm.groupSubjectId}
                                        onChange={(event) =>
                                            setFolderForm((current) => ({
                                                ...current,
                                                groupSubjectId: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">Без предмета</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <div>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={createFolder.isPending || !folderForm.name.trim()}
                                    >
                                        {createFolder.isPending ? (
                                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <FolderPlusIcon className="mr-2 size-4" />
                                        )}
                                        Створити папку
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            ) : null}
            {files.length === 0 ? (
                <EmptyState
                    title="Файлів ще немає"
                    description="Завантажуйте навчальні матеріали, методички, лабораторні або посилання на предмети."
                />
            ) : (
                <div className="space-y-3">
                    {files.map((file) => (
                        <Card key={file.id}>
                            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="font-medium text-foreground">
                                        {file.originalName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatFileSize(file.size)} · {formatDateTime(file.createdAt)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {file.groupSubject ? (
                                        <Badge variant="outline">{file.groupSubject.name}</Badge>
                                    ) : null}
                                    <a
                                        className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                                        href={`${API_BASE_URL}${ENDPOINTS.groups.downloadFile(groupId, file.id)}`}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        Відкрити
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
    const renderAnnouncements = () => (
        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.postAnnouncements}
                requiredRole={resolvedGroup.postAnnouncementsRole}
            />
            {permissions.postAnnouncements ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Нове оголошення</CardTitle>
                        <CardDescription>
                            Для важливих повідомлень, організаційних змін і дедлайнів по групі.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateAnnouncement}>
                            <div className="md:col-span-2">
                                <Field label="Заголовок">
                                    <input
                                        required
                                        className={inputClassName}
                                        value={announcementForm.title}
                                        onChange={(event) =>
                                            setAnnouncementForm((current) => ({
                                                ...current,
                                                title: event.target.value,
                                            }))
                                        }
                                    />
                                </Field>
                            </div>
                            <Field label="Тип">
                                <select
                                    className={selectClassName}
                                    value={announcementForm.type}
                                    onChange={(event) =>
                                        setAnnouncementForm((current) => ({
                                            ...current,
                                            type: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="organizational">Організаційне</option>
                                    <option value="academic">Навчальне</option>
                                    <option value="headman">Від старости</option>
                                    <option value="teacher">Від викладача</option>
                                </select>
                            </Field>
                            <Field label="Дедлайн (необов’язково)">
                                <input
                                    type="datetime-local"
                                    className={inputClassName}
                                    value={announcementForm.deadlineAt}
                                    onChange={(event) =>
                                        setAnnouncementForm((current) => ({
                                            ...current,
                                            deadlineAt: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Текст">
<textarea
    required
    className={textareaClassName}
    value={announcementForm.content}
    onChange={(event) =>
        setAnnouncementForm((current) => ({
            ...current,
            content: event.target.value,
        }))
    }
/>
                                </Field>
                            </div>
                            <div className="md:col-span-2 flex flex-wrap gap-4">
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        checked={announcementForm.isPinned}
                                        onChange={(event) =>
                                            setAnnouncementForm((current) => ({
                                                ...current,
                                                isPinned: event.target.checked,
                                            }))
                                        }
                                        type="checkbox"
                                    />
                                    Закріпити
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        checked={announcementForm.requiresAcknowledgement}
                                        onChange={(event) =>
                                            setAnnouncementForm((current) => ({
                                                ...current,
                                                requiresAcknowledgement: event.target.checked,
                                            }))
                                        }
                                        type="checkbox"
                                    />
                                    Потрібне підтвердження
                                </label>
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        createAnnouncement.isPending ||
                                        !announcementForm.title.trim() ||
                                        !announcementForm.content.trim()
                                    }
                                >
                                    {createAnnouncement.isPending ? (
                                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <MegaphoneIcon className="mr-2 size-4" />
                                    )}
                                    Опублікувати
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}
            {announcements.length === 0 ? (
                <EmptyState
                    title="Оголошень ще немає"
                    description="Тут варто тримати важливі повідомлення для всіх учасників групи."
                />
            ) : (
                <div className="space-y-3">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardContent className="space-y-3 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-medium text-foreground">
                                                {announcement.title}
                                            </div>
                                            {announcement.isPinned ? (
                                                <Badge variant="default">Закріплено</Badge>
                                            ) : null}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {announcement.creator
                                                ? `${announcement.creator.firstName} ${announcement.creator.lastName ?? ""}`.trim()
                                                : "Без автора"}{" "}
                                            · {formatDateTime(announcement.createdAt)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">{announcement.type}</Badge>
                                        {announcement.deadlineAt ? (
                                            <Badge variant="secondary">
                                                До {formatDateTime(announcement.deadlineAt)}
                                            </Badge>
                                        ) : null}
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {announcement.content}
                                </p>
                                {announcement.requiresAcknowledgement ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={announcement.acknowledged ? "secondary" : "outline"}                                        disabled={                                            announcement.acknowledged ||                                            (acknowledgeAnnouncement.isPending &&                                                acknowledgeAnnouncement.variables?.announcementId ===                                                    announcement.id)                                        }                                        onClick={() =>                                            acknowledgeAnnouncement.mutate({                                                groupId,                                                announcementId: announcement.id,                                            })                                        }                                    >                                        <CheckCheckIcon className="mr-2 size-4" />                                        {announcement.acknowledged                                            ? "Підтверджено"                                            : "Підтвердити ознайомлення"}                                    </Button>                                ) : null}                            </CardContent>                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
    const renderChat = () => (        <div className="space-y-6 px-4 py-6 md:px-6">
            {channels.length === 0 ? (                <EmptyState
                    title="Каналів ще немає"
                    description="Після створення групи мають бути щонайменше стандартні канали. Якщо їх немає, перевірте дані на бекенді."
                />
            ) : (                <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Канали</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {channels.map((channel) => {                                const isActive = channel.id === selectedChannelId;
                                return (                                    <button
                                        key={channel.id}
                                        className={cn(                                            "flex w-full flex-col items-start rounded-xl border px-3 py-3 text-left transition",
                                            isActive
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-border/70 hover:bg-muted/40",
                                        )}
                                        onClick={() => {                                            const next = new URLSearchParams(searchParams);                                            next.set("channel", String(channel.id));                                            setSearchParams(next, { replace: true });                                        }}
                                        type="button"
                                    >
<span className="font-medium text-foreground">
{channel.name}
</span>
                                        <span className="text-xs text-muted-foreground">                                            {channel.description || channel.type}                                        </span>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>
                    <Card>                        <CardHeader>                            <CardTitle>{activeChannel?.name ?? "Повідомлення"}</CardTitle>                            <CardDescription>                                Канальний чат групи. Тут вже можна писати навіть без керуючих прав.                             </CardDescription>                        </CardHeader>                        <CardContent className="space-y-4">                            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">                                {messagesQuery.isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-20 rounded-2xl" />                                    ))                                ) : messages.length === 0 ? (                                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">                                        У цьому каналі поки тихо.                                    </div>                                ) : (                                    messages.map((message) => (                                        <div                                            key={message.id}                                            className="rounded-2xl border border-border/70 px-4 py-3"                                        >                                            <div className="flex items-center justify-between gap-3">                                                <div className="text-sm font-medium text-foreground">                                                    {message.user                                                        ? `${message.user.firstName} ${message.user.lastName ?? ""}`.trim()                                                        : "Система"}                                                </div>                                                <div className="text-xs text-muted-foreground">                                                    {formatDateTime(message.createdAt)}                                                </div>                                            </div>                                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">                                                {message.content || "Без тексту"}                                            </p>                                        </div>
                        ))
                    )}
                    </div>
                        <form className="space-y-3" onSubmit={handleSendMessage}>                                <Field label="Нове повідомлення">                                    <textarea                                        className={textareaClassName}                                        value={messageText}                                        onChange={(event) => setMessageText(event.target.value)}                                        placeholder="Напишіть повідомлення в канал"                                     />                                 </Field>                                <Button                                    type="submit"                                     disabled={!selectedChannelId || createMessage.isPending || !messageText.trim()}                                >                                     {createMessage.isPending ? (
                            <Loader2Icon className="mr-2 size-4 animate-spin" />                                    ) : (                                        <MessageSquareIcon className="mr-2 size-4" />                                    )}                                    Надіслати                                 </Button>
                        </form>
                    </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
    const renderPolls = () => (        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.createPolls}
                requiredRole={resolvedGroup.createPollsRole}
                allowedLabel="Ви можете створювати опитування. Голосувати можуть усі учасники групи."
            />
            {permissions.createPolls ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Нове опитування</CardTitle>
                        <CardDescription>
                            Варіанти відповідей можна вказати з нового рядка.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreatePoll}>
                            <div className="md:col-span-2">
                                <Field label="Питання">
                                    <input
                                        required
                                        className={inputClassName}
                                        value={pollForm.title}
                                        onChange={(event) =>
                                            setPollForm((current) => ({
                                                ...current,
                                                title: event.target.value,
                                            }))
                                        }
                                    />
                                </Field>
                            </div>
                            <Field label="Опис">
<textarea
    className={textareaClassName}
    value={pollForm.description}
    onChange={(event) =>
        setPollForm((current) => ({
            ...current,
            description: event.target.value,
        }))
    }
/>
                            </Field>
                            <Field label="Закривається">
                                <input
                                    type="datetime-local"
                                    className={inputClassName}
                                    value={pollForm.closesAt}
                                    onChange={(event) =>
                                        setPollForm((current) => ({
                                            ...current,
                                            closesAt: event.target.value,
                                        }))
                                    }
                                />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Варіанти відповідей" hint="Мінімум два рядки">
<textarea
    required
    className={textareaClassName}
    value={pollForm.optionsText}
    onChange={(event) =>
        setPollForm((current) => ({
            ...current,
            optionsText: event.target.value,
        }))
    }
/>
                                </Field>
                            </div>
                            <div className="md:col-span-2 flex flex-wrap gap-4">
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={pollForm.allowsMultiple}
                                        onChange={(event) =>
                                            setPollForm((current) => ({
                                                ...current,
                                                allowsMultiple: event.target.checked,
                                            }))
                                        }
                                    />
                                    Дозволити кілька відповідей
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={pollForm.isAnonymous}
                                        onChange={(event) =>
                                            setPollForm((current) => ({
                                                ...current,
                                                isAnonymous: event.target.checked,
                                            }))
                                        }
                                    />
                                    Анонімне
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={pollForm.showResults}
                                        onChange={(event) =>
                                            setPollForm((current) => ({
                                                ...current,
                                                showResults: event.target.checked,
                                            }))
                                        }
                                    />
                                    Показувати результати
                                </label>
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={createPoll.isPending || !pollForm.title.trim()}
                                >
                                    {createPoll.isPending ? (
                                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                                    ) : (                                        <VoteIcon className="mr-2 size-4" />
                                    )}
                                    Створити опитування
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : null}
            {polls.length === 0 ? (                <EmptyState
                    title="Опитувань ще немає"
                    description="Використовуйте їх для голосувань по датах, форматах занять або організаційних рішеннях."
                />
            ) : (                <div className="space-y-3">
                    {polls.map((poll) => {                        const selected = pollSelections[poll.id] ?? poll.options
                        .filter((option) => option.votedByMe)
                        .map((option) => option.id);
                        return (                            <Card key={poll.id}>
                                <CardContent className="space-y-4 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="font-medium text-foreground">{poll.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {poll.description || "Без опису"}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant={poll.status === "open" ? "default" : "secondary"}>
                                                {poll.status === "open" ? "Відкрите" : "Закрите"}
                                            </Badge>
                                            {poll.closesAt ? (
                                                <Badge variant="outline">
                                                    До {formatDateTime(poll.closesAt)}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {poll.options.map((option) => {                                            const checked = selected.includes(option.id);                                            const choiceType = poll.allowsMultiple ? "checkbox" : "radio";
                                            return (
                                                <label
                                                    key={option.id}
                                                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 px-4 py-3"
                                                >
<span className="flex items-center gap-3 text-sm text-foreground">                                                        <input
    type={choiceType}
    checked={checked}
    disabled={poll.status !== "open"}
    name={`poll-${poll.id}`}
    onChange={() => {                                                                setPollSelections((current) => {
        const currentValue = current[poll.id] ?? [];
        if (!poll.allowsMultiple) {
            return { ...current, [poll.id]: [option.id] };
        }
        return currentValue.includes(option.id)
            ? {
                ...current,
                [poll.id]: currentValue.filter((id) => id !== option.id),
            }
            : {
                ...current,
                [poll.id]: [...currentValue, option.id],
            };
    });                                                            }}
/>                                                        {option.label}
</span>
                                                    {poll.showResults ? (
                                                        <span className="text-sm text-muted-foreground">                                                            {option.votesCount}
</span>
                                                    ) : null}
                                                </label>
                                            );                                        })}
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={                                            poll.status !== "open" ||
                                            votePoll.isPending ||
                                            selected.length === 0
                                        }
                                        onClick={() =>
                                            votePoll.mutate({
                                                groupId,
                                                pollId: poll.id,
                                                optionIds: selected,
                                            })
                                        }
                                    >
                                        Проголосувати
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
    const renderMembers = () => (        <div className="space-y-6 px-4 py-6 md:px-6">
            <Card>
                <CardHeader>
                    <CardTitle>Активні учасники</CardTitle>
                    <CardDescription>
                        Поточний склад групи і ролі всередині неї.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {members.filter((member) => member.status === "active").length === 0 ? (
                        <p className="text-sm text-muted-foreground">Немає активних учасників.</p>
                    ) : (                        members
                            .filter((member) => member.status === "active")
                            .map((member) => (                                <div
                                    key={member.id}
                                    className="flex flex-col gap-2 rounded-2xl border border-border/70 px-4 py-3 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {member.user
                                                ? `${member.user.firstName} ${member.user.lastName ?? ""}`.trim()
                                                : "Користувач"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">                                            @{member.user?.username || "unknown"} ·                                             {member.joinedAt ? ` ${formatDate(member.joinedAt)}` : " дата невідома"}                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">                                        <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>                                        {member.subgroup ? (
                                        <Badge variant="secondary">{member.subgroup}</Badge>                                        ) : null}                                    </div>
                                </div>
                            ))
                    )}
                </CardContent>
            </Card>
            <AccessNotice
                allowed={permissions.invite}
                requiredRole={resolvedGroup.inviteRole}
                allowedLabel="Ви можете переглядати й обробляти запити на вступ."
            />
            {permissions.invite ? (
                <Card>                    <CardHeader>                        <CardTitle>Запити на вступ</CardTitle>                        <CardDescription>                            Актуально, якщо політика групи дозволяє надсилати запит замість інвайта.                         </CardDescription>                    </CardHeader>                    <CardContent className="space-y-3">                        {joinRequests.filter((request) => request.status === "pending").length === 0 ? (
                    <p className="text-sm text-muted-foreground">                                Очікуючих запитів немає.                             </p>                        ) : (
                    joinRequests                                .filter((request) => request.status === "pending")                                .map((request) => (                                    <div                                        key={request.id}                                        className="space-y-3 rounded-2xl border border-border/70 px-4 py-3"                                    >                                        <div>                                            <div className="font-medium text-foreground">                                                {request.user                                                    ? `${request.user.firstName} ${request.user.lastName ?? ""}`.trim()                                                    : "Користувач"}                                            </div>                                            <div className="text-sm text-muted-foreground">                                                @{request.user?.username || "unknown"} · {formatDateTime(request.createdAt)}                                            </div>                                        </div>                                        {request.message ? (
                            <p className="text-sm text-muted-foreground">
                                {request.message}
                            </p>
                        ) : null}
                            <div className="flex flex-wrap gap-2">                                            <Button                                                size="sm"                                                 disabled={respondJoinRequest.isPending}                                                onClick={() =>                                                     respondJoinRequest.mutate({
                                groupId,
                                joinRequestId: request.id,                                                        status: "approved",                                                    })                                                }                                                type="button"                                             >                                                 Схвалити                                             </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={respondJoinRequest.isPending}
                                    onClick={() =>
                                        respondJoinRequest.mutate({                                                        groupId,                                                         joinRequestId: request.id,
                                            status: "rejected",
                                        })
                                    }
                                    type="button"
                                >
                                    Відхилити
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                </CardContent>
                </Card>
            ) : null}
        </div>
    );
    const renderSettings = () => (        <div className="space-y-6 px-4 py-6 md:px-6">
            <AccessNotice
                allowed={permissions.edit}
                requiredRole={resolvedGroup.editRole}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Налаштування групи</CardTitle>
                    <CardDescription>
                        Тут визначається, хто саме може керувати структурою групи.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSaveSettings}>
                        <Field label="Назва">
                            <input
                                disabled={!permissions.edit}
                                className={inputClassName}
                                value={settingsForm.name}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Код">
                            <input
                                disabled={!permissions.edit}
                                className={inputClassName}
                                value={settingsForm.code}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        code: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Колір">
                            <input
                                disabled={!permissions.edit}
                                type="color"
                                className="h-10 w-24 rounded-xl border border-border bg-background p-1"
                                value={settingsForm.color}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        color: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Видимість">
                            <select
                                disabled={!permissions.edit}
                                className={selectClassName}
                                value={settingsForm.visibility}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        visibility: event.target.value as GroupView["visibility"],
                                    }))
                                }
                            >
                                <option value="private">Приватна</option>
                                <option value="public">Публічна</option>
                            </select>
                        </Field>
                        <Field label="Політика вступу">
                            <select
                                disabled={!permissions.edit}
                                className={selectClassName}
                                value={settingsForm.joinPolicy}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        joinPolicy: event.target.value as GroupView["joinPolicy"],
                                    }))
                                }
                            >
                                <option value="invite_only">Лише за інвайтом</option>
                                <option value="invite_or_request">Інвайт або запит</option>
                                <option value="code_or_request">Код групи або запит</option>
                            </select>
                        </Field>
                        <Field label="Хто створює інвайти">
                            <select
                                disabled={!permissions.edit}
                                className={selectClassName}
                                value={settingsForm.inviteRole}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        inviteRole: event.target.value as GroupRole,
                                    }))
                                }
                            >
                                {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Хто редагує групу">
                            <select
                                disabled={!permissions.edit}
                                className={selectClassName}
                                value={settingsForm.editRole}
                                onChange={(event) =>
                                    setSettingsForm((current) => ({
                                        ...current,
                                        editRole: event.target.value as GroupRole,
                                    }))
                                }
                            >
                                {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Хто керує предметами">                            <select                                disabled={!permissions.edit}                                className={selectClassName}                                value={settingsForm.manageSubjectsRole}                                onChange={(event) =>                                     setSettingsForm((current) => ({
                            ...current,
                            manageSubjectsRole: event.target.value as GroupRole,                                    }))                                }                            >                                 {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                            {label}
                        </option>                                ))}                            </select>
                        </Field>
                        <Field label="Хто керує розкладом">                            <select                                disabled={!permissions.edit}                                className={selectClassName}                                value={settingsForm.manageScheduleRole}                                onChange={(event) =>                                     setSettingsForm((current) => ({
                            ...current,
                            manageScheduleRole: event.target.value as GroupRole,                                    }))                                }                            >                                 {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                            {label}
                        </option>                                ))}                            </select>
                        </Field>
                        <Field label="Хто керує дедлайнами">                            <select                                disabled={!permissions.edit}                                className={selectClassName}                                value={settingsForm.manageDeadlinesRole}                                onChange={(event) =>                                     setSettingsForm((current) => ({
                            ...current,
                            manageDeadlinesRole: event.target.value as GroupRole,                                    }))                                }                            >                                 {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                            {label}
                        </option>                                ))}                            </select>
                        </Field>
                        <Field label="Хто керує файлами">                            <select                                disabled={!permissions.edit}                                className={selectClassName}                                value={settingsForm.manageFilesRole}                                onChange={(event) =>                                     setSettingsForm((current) => ({
                            ...current,
                            manageFilesRole: event.target.value as GroupRole,                                    }))                                }                            >                                 {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                            {label}
                        </option>                                ))}                            </select>
                        </Field>
                        <Field label="Хто публікує оголошення">                            <select                                disabled={!permissions.edit}                                className={selectClassName}                                value={settingsForm.postAnnouncementsRole}                                onChange={(event) =>                                     setSettingsForm((current) => ({
                            ...current,
                            postAnnouncementsRole: event.target.value as GroupRole,                                    }))                                }                            >                                 {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                            {label}
                        </option>                                ))}                            </select>
                        </Field>
                        <Field label="Хто створює опитування">                            <select                                disabled={!permissions.edit}                                className={selectClassName}                                value={settingsForm.createPollsRole}                                onChange={(event) =>                                     setSettingsForm((current) => ({
                            ...current,
                            createPollsRole: event.target.value as GroupRole,                                    }))                                }                            >                                 {Object.entries(ROLE_LABELS).map(([value, label]) => (                                    <option key={value} value={value}>
                            {label}
                        </option>                                ))}                            </select>
                        </Field>
                        <div className="md:col-span-2 xl:col-span-3">                            <Field label="Опис">                                <textarea                                    disabled={!permissions.edit}                                    className={textareaClassName}                                    value={settingsForm.description}                                    onChange={(event) =>                                         setSettingsForm((current) => ({
                            ...current,
                            description: event.target.value,                                        }))                                    }                                />                             </Field>                        </div>
                        <div className="md:col-span-2 xl:col-span-3">                            <Button                                disabled={updateGroup.isPending || !permissions.edit}                                type="submit"                             >                                 {updateGroup.isPending ? (
                            <Loader2Icon className="mr-2 size-4 animate-spin" />                                ) : (                                    <Settings2Icon className="mr-2 size-4" />                                )}                                Зберегти налаштування                             </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
    const content = (() => {        switch (currentSection) {
        case "overview":
            return renderOverview();
        case "subjects":                return renderSubjects();
        case "schedule":                return renderSchedule();
        case "deadlines":                return renderDeadlines();
        case "files":                return renderFiles();
        case "announcements":                return renderAnnouncements();
        case "chat":                return renderChat();
        case "polls":                return renderPolls();
        case "members":                return renderMembers();
        case "settings":                return renderSettings();
        default:                return renderOverview();
    }    })();
    return (        <div className="flex min-h-0 flex-col">
            <GroupsSidebar
                group={{                    ...resolvedGroup,
                    createdAt: null,
                    updatedAt: null,
                    slug: "",
                    avatar: null,
                    isActive: true,
                    institutionShortName: null,
                    departmentName: null,
                    educationLevel: null,
                    studyForm: null,
                    owner: null,
                    creator: null,
                }}
                currentRoleLabel={currentRole ? ROLE_LABELS[currentRole] : "Без ролі"}
                currentSection={currentSection}
                setSection={setSection}
                counts={counts}
            />
            <div className="space-y-4">
                <div className="overflow-x-auto md:hidden">
                    <div className="flex min-w-max gap-2 pb-2">
                        {sectionOrder.map((section) => (                            <Button
                                key={section}
                                onClick={() => setSection(section)}
                                size="sm"
                                type="button"
                                variant={currentSection === section ? "default" : "outline"}
                            >
                                {GROUP_SECTION_LABELS[section]}
                            </Button>
                        ))}
                    </div>
                </div>
                <Card className="overflow-hidden border-border/70">
                    <SectionHeader
                        eyebrow={`${resolvedGroup.code} · ${currentRole ? ROLE_LABELS[currentRole] : "Без ролі"}`}
                        title={GROUP_SECTION_LABELS[currentSection]}
                        description={                            currentSection === "overview"
                            ? "Точка входу в роботу з групою: що налаштовано, що доступно і що робити далі."
                            : currentSection === "settings"
                                ? "Саме тут визначається, хто що може робити в групі."
                                : `Секція "${GROUP_SECTION_LABELS[currentSection]}" для простору ${resolvedGroup.name}.`
                        }
                        actions={                            <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                                {JOIN_POLICY_LABELS[resolvedGroup.joinPolicy]}
                            </Badge>
                            <Badge variant="secondary">
                                {resolvedGroup.visibility === "private" ? "Приватна" : "Публічна"}
                            </Badge>
                        </div>
                        }
                    />
                    {content}
                </Card>
            </div>
        </div>
    );
}