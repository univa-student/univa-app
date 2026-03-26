import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
    CreateGroupAnnouncementPayload,
    CreateGroupDeadlinePayload,
    CreateGroupFolderPayload,
    CreateGroupInvitePayload,
    CreateGroupLessonPayload,
    CreateGroupMessagePayload,
    CreateGroupPayload,
    CreateGroupPollPayload,
    CreateGroupSubjectPayload,
    JoinGroupPayload,
    UpdateGroupPayload,
} from "../model/types";
import { groupQueries } from "./queries";

function invalidateGroupScope(queryClient: ReturnType<typeof useQueryClient>, groupId: number) {
    return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
        queryClient.invalidateQueries({ queryKey: ["groups", groupId] }),
    ]);
}

export function useGroups() {
    return useQuery(groupQueries.list());
}

export function useGroup(groupId: number | null) {
    return useQuery({
        ...groupQueries.show(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupOverview(groupId: number | null) {
    return useQuery({
        ...groupQueries.overview(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupMembers(groupId: number | null) {
    return useQuery({
        ...groupQueries.members(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupInvites(groupId: number | null) {
    return useQuery({
        ...groupQueries.invites(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupJoinRequests(groupId: number | null) {
    return useQuery({
        ...groupQueries.joinRequests(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupSubjects(groupId: number | null) {
    return useQuery({
        ...groupQueries.subjects(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupAnnouncements(groupId: number | null) {
    return useQuery({
        ...groupQueries.announcements(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupPolls(groupId: number | null) {
    return useQuery({
        ...groupQueries.polls(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupChannels(groupId: number | null) {
    return useQuery({
        ...groupQueries.channels(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupChannelMessages(groupId: number | null, channelId: number | null) {
    return useQuery({
        ...groupQueries.channelMessages(groupId!, channelId!),
        enabled: groupId != null && groupId > 0 && channelId != null && channelId > 0,
    });
}

export function useGroupDeadlines(groupId: number | null) {
    return useQuery({
        ...groupQueries.deadlines(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupRecentFiles(groupId: number | null) {
    return useQuery({
        ...groupQueries.recentFiles(groupId!),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupSchedule(groupId: number | null, from: string, to: string) {
    return useQuery({
        ...groupQueries.schedule(groupId!, from, to),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupFiles(groupId: number | null, folderId?: number | null, groupSubjectId?: number | null) {
    return useQuery({
        ...groupQueries.files(groupId!, folderId, groupSubjectId),
        enabled: groupId != null && groupId > 0,
    });
}

export function useGroupFolders(groupId: number | null, parentId?: number | null, groupSubjectId?: number | null) {
    return useQuery({
        ...groupQueries.folders(groupId!, parentId, groupSubjectId),
        enabled: groupId != null && groupId > 0,
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateGroupPayload) => groupQueries.create(payload).queryFn(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] }).then(() => {});
        },
    });
}

export function useJoinGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: JoinGroupPayload) => groupQueries.join(payload).queryFn(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups"] }).then(() => {});
        },
    });
}

export function useUpdateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: UpdateGroupPayload }) =>
            groupQueries.update(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupInvite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupInvitePayload }) =>
            groupQueries.createInvite(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useRespondToGroupJoinRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, joinRequestId, status }: { groupId: number; joinRequestId: number; status: "approved" | "rejected" }) =>
            groupQueries.respondJoinRequest(groupId, joinRequestId, status).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupSubjectPayload }) =>
            groupQueries.createSubject(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupAnnouncementPayload }) =>
            groupQueries.createAnnouncement(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useAcknowledgeGroupAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, announcementId }: { groupId: number; announcementId: number }) =>
            groupQueries.acknowledgeAnnouncement(groupId, announcementId).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupDeadline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupDeadlinePayload }) =>
            groupQueries.createDeadline(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useUpdateGroupDeadlineProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, deadlineId, status }: { groupId: number; deadlineId: number; status: "not_started" | "in_progress" | "completed" }) =>
            groupQueries.updateDeadlineProgress(groupId, deadlineId, status).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupChannelMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, channelId, payload }: { groupId: number; channelId: number; payload: CreateGroupMessagePayload }) =>
            groupQueries.createChannelMessage(groupId, channelId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: FormData }) =>
            groupQueries.createFile(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupFolder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupFolderPayload }) =>
            groupQueries.createFolder(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupLessonPayload }) =>
            groupQueries.createLesson(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useCreateGroupPoll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateGroupPollPayload }) =>
            groupQueries.createPoll(groupId, payload).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}

export function useVoteGroupPoll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, pollId, optionIds }: { groupId: number; pollId: number; optionIds: number[] }) =>
            groupQueries.votePoll(groupId, pollId, optionIds).queryFn(),
        onSuccess: (_, variables) => {
            invalidateGroupScope(queryClient, variables.groupId).then(() => {});
        },
    });
}
