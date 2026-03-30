import { useMemo } from "react";
import { format, subDays, addDays } from "date-fns";
import { useSearchParams } from "react-router-dom";

import { useAuthUser } from "@/modules/auth/model/useAuthUser";
import {
    useGroup,
    useGroupAnnouncements,
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
} from "@/modules/groups/api/hooks";
import { GroupAnnouncementsSection } from "@/modules/groups/announcements/group-announcements-section";
import { GroupChatSection } from "@/modules/groups/chat/group-chat-section";
import { GroupDeadlinesSection } from "@/modules/groups/deadlines/group-deadlines-section";
import { GroupFilesSection } from "@/modules/groups/files/group-files-section";
import { GroupMembersSection } from "@/modules/groups/members/group-members-section";
import { GroupOverviewSection } from "@/modules/groups/overview/group-overview-section";
import { GroupPollsSection } from "@/modules/groups/polls/group-polls-section";
import { GroupScheduleSection } from "@/modules/groups/schedule/group-schedule-section";
import { GroupSettingsSection } from "@/modules/groups/settings/group-settings-section";
import { GroupSubjectsSection } from "@/modules/groups/subjects/group-subjects-section";
import { roleAllows } from "@/modules/groups/shared/utils";
import { ROLE_LABELS, type GroupRole } from "@/modules/groups/shared/view";
import type { GroupSection } from "@/modules/groups/ui/groups-sidebar";
import {
    DEFAULT_GROUP_SECTION,
    GroupsSidebar,
} from "@/modules/groups/ui/groups-sidebar";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

interface GroupWorkspaceProps {
    groupId: number;
}

const VALID_SECTIONS = new Set<GroupSection>([
    "overview",
    "announcements",
    "chat",
    "subjects",
    "schedule",
    "deadlines",
    "files",
    "polls",
    "members",
    "settings",
]);

function resolveSection(value: string | null): GroupSection {
    if (value && VALID_SECTIONS.has(value as GroupSection)) {
        return value as GroupSection;
    }

    return DEFAULT_GROUP_SECTION;
}

export function GroupWorkspace({ groupId }: GroupWorkspaceProps) {
    const user = useAuthUser();
    const [searchParams, setSearchParams] = useSearchParams();

    const section = resolveSection(searchParams.get("section"));
    const rangeFrom = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const rangeTo = format(addDays(new Date(), 60), "yyyy-MM-dd");

    const { data: group, isLoading: isGroupLoading, error } = useGroup(groupId);
    const { data: overview } = useGroupOverview(groupId);
    const { data: members = [] } = useGroupMembers(groupId);
    const { data: subjects = [] } = useGroupSubjects(groupId);
    const { data: announcements = [] } = useGroupAnnouncements(groupId);
    const { data: polls = [] } = useGroupPolls(groupId);
    const { data: channels = [] } = useGroupChannels(groupId);
    const { data: deadlines = [] } = useGroupDeadlines(groupId);
    const { data: recentFiles = [] } = useGroupRecentFiles(groupId);
    const { data: schedule = [] } = useGroupSchedule(groupId, rangeFrom, rangeTo);

    const currentMember = useMemo(
        () => members.find((member) => member.userId === user?.id) ?? null,
        [members, user?.id],
    );
    const currentRole = (currentMember?.role as GroupRole | undefined) ?? null;
    const currentRoleLabel = currentRole ? ROLE_LABELS[currentRole] : "Учасник";
    const canLoadMembershipAdminData =
        group != null &&
        roleAllows(currentRole, (group.inviteRole as GroupRole) ?? "headman");

    const { data: invites = [] } = useGroupInvites(groupId, canLoadMembershipAdminData);
    const { data: joinRequests = [] } = useGroupJoinRequests(
        groupId,
        canLoadMembershipAdminData,
    );

    const permissions = useMemo(() => {
        if (!group) {
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
            invite: roleAllows(currentRole, (group.inviteRole as GroupRole) ?? "headman"),
            edit: roleAllows(currentRole, (group.editRole as GroupRole) ?? "moderator"),
            manageSubjects: roleAllows(
                currentRole,
                (group.manageSubjectsRole as GroupRole) ?? "headman",
            ),
            manageSchedule: roleAllows(
                currentRole,
                (group.manageScheduleRole as GroupRole) ?? "headman",
            ),
            manageDeadlines: roleAllows(
                currentRole,
                (group.manageDeadlinesRole as GroupRole) ?? "headman",
            ),
            manageFiles: roleAllows(
                currentRole,
                (group.manageFilesRole as GroupRole) ?? "headman",
            ),
            postAnnouncements: roleAllows(
                currentRole,
                (group.postAnnouncementsRole as GroupRole) ?? "headman",
            ),
            createPolls: roleAllows(
                currentRole,
                (group.createPollsRole as GroupRole) ?? "headman",
            ),
        };
    }, [currentRole, group]);

    const counts = useMemo(
        () => ({
            overview: 0,
            announcements: announcements.length,
            chat: channels.length,
            subjects: subjects.length,
            schedule: schedule.length,
            deadlines: deadlines.length,
            files: recentFiles.length,
            polls: polls.length,
            members: members.length,
            settings: 0,
        }),
        [
            announcements.length,
            channels.length,
            deadlines.length,
            members.length,
            polls.length,
            recentFiles.length,
            schedule.length,
            subjects.length,
        ],
    );

    function setSection(nextSection: GroupSection) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("section", nextSection);
        setSearchParams(nextParams, { replace: true });
    }

    if (isGroupLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-14 w-64 rounded-2xl" />
                <Skeleton className="h-[520px] w-full rounded-[32px]" />
            </div>
        );
    }

    if (error || !group) {
        return (
            <Card className="border-dashed border-border/80">
                <CardContent className="space-y-2 py-12 text-center">
                    <div className="text-xl font-semibold text-foreground">
                        Групу не вдалося завантажити
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Перевірте права доступу або спробуйте відкрити сторінку пізніше.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <GroupsSidebar
                group={group}
                currentSection={section}
                setSection={setSection}
                currentRoleLabel={currentRoleLabel}
                counts={counts}
            />

            {section === "overview" ? (
                <GroupOverviewSection group={group} overview={overview} counts={counts} />
            ) : null}

            {section === "announcements" ? (
                <GroupAnnouncementsSection
                    groupId={groupId}
                    announcements={announcements}
                    canPost={permissions.postAnnouncements}
                    requiredRole={(group.postAnnouncementsRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "chat" ? (
                <GroupChatSection groupId={groupId} channels={channels} />
            ) : null}

            {section === "subjects" ? (
                <GroupSubjectsSection
                    groupId={groupId}
                    subjects={subjects}
                    canManage={permissions.manageSubjects}
                    requiredRole={(group.manageSubjectsRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "schedule" ? (
                <GroupScheduleSection
                    groupId={groupId}
                    items={schedule}
                    subjects={subjects}
                    canManage={permissions.manageSchedule}
                    requiredRole={(group.manageScheduleRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "deadlines" ? (
                <GroupDeadlinesSection
                    groupId={groupId}
                    deadlines={deadlines}
                    subjects={subjects}
                    canManage={permissions.manageDeadlines}
                    requiredRole={(group.manageDeadlinesRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "files" ? (
                <GroupFilesSection
                    groupId={groupId}
                    subjects={subjects}
                    canManage={permissions.manageFiles}
                    requiredRole={(group.manageFilesRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "polls" ? (
                <GroupPollsSection
                    groupId={groupId}
                    polls={polls}
                    canCreate={permissions.createPolls}
                    requiredRole={(group.createPollsRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "members" ? (
                <GroupMembersSection
                    groupId={groupId}
                    members={members}
                    invites={invites}
                    joinRequests={joinRequests}
                    canInvite={permissions.invite}
                    requiredRole={(group.inviteRole as GroupRole) ?? "headman"}
                />
            ) : null}

            {section === "settings" ? (
                <GroupSettingsSection
                    group={group}
                    canEdit={permissions.edit}
                    requiredRole={(group.editRole as GroupRole) ?? "moderator"}
                />
            ) : null}
        </div>
    );
}
