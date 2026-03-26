import type { FileItem, FolderItem } from "@/modules/files/model/types";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { apiFetch } from "@/shared/api/http";

import type {
    CreateGroupPayload,
    CreateGroupAnnouncementPayload,
    CreateGroupDeadlinePayload,
    CreateGroupFolderPayload,
    CreateGroupInvitePayload,
    CreateGroupLessonPayload,
    CreateGroupMessagePayload,
    CreateGroupPollPayload,
    CreateGroupSubjectPayload,
    Group,
    GroupAnnouncement,
    GroupChannel,
    GroupDeadline,
    GroupInvite,
    GroupJoinRequest,
    GroupMember,
    GroupMessage,
    GroupOverview,
    GroupPoll,
    GroupScheduleItem,
    GroupSubject,
    JoinGroupPayload,
    UpdateGroupPayload,
} from "../model/types";

export const groupQueries = {
    list: () => ({
        queryKey: ["groups"],
        queryFn: () => apiFetch<Group[]>(ENDPOINTS.groups.list, { cacheTtlMs: 60_000 }),
        staleTime: 60_000,
    }),
    show: (id: number) => ({
        queryKey: ["groups", id],
        queryFn: () => apiFetch<Group>(ENDPOINTS.groups.show(id), { cacheTtlMs: 60_000 }),
        staleTime: 60_000,
    }),
    overview: (id: number) => ({
        queryKey: ["groups", id, "overview"],
        queryFn: () => apiFetch<GroupOverview>(ENDPOINTS.groups.overview(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    members: (id: number) => ({
        queryKey: ["groups", id, "members"],
        queryFn: () => apiFetch<GroupMember[]>(ENDPOINTS.groups.members(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    invites: (id: number) => ({
        queryKey: ["groups", id, "invites"],
        queryFn: () => apiFetch<GroupInvite[]>(ENDPOINTS.groups.invites(id), { cacheTtlMs: 15_000 }),
        staleTime: 15_000,
    }),
    joinRequests: (id: number) => ({
        queryKey: ["groups", id, "join-requests"],
        queryFn: () => apiFetch<GroupJoinRequest[]>(ENDPOINTS.groups.joinRequests(id), { cacheTtlMs: 15_000 }),
        staleTime: 15_000,
    }),
    subjects: (id: number) => ({
        queryKey: ["groups", id, "subjects"],
        queryFn: () => apiFetch<GroupSubject[]>(ENDPOINTS.groups.subjects(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    announcements: (id: number) => ({
        queryKey: ["groups", id, "announcements"],
        queryFn: () => apiFetch<GroupAnnouncement[]>(ENDPOINTS.groups.announcements(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    polls: (id: number) => ({
        queryKey: ["groups", id, "polls"],
        queryFn: () => apiFetch<GroupPoll[]>(ENDPOINTS.groups.polls(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    channels: (id: number) => ({
        queryKey: ["groups", id, "channels"],
        queryFn: () => apiFetch<GroupChannel[]>(ENDPOINTS.groups.channels(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    channelMessages: (groupId: number, channelId: number) => ({
        queryKey: ["groups", groupId, "channels", channelId, "messages"],
        queryFn: () => apiFetch<GroupMessage[]>(ENDPOINTS.groups.channelMessages(groupId, channelId), { cacheTtlMs: 15_000 }),
        staleTime: 15_000,
    }),
    deadlines: (id: number) => ({
        queryKey: ["groups", id, "deadlines"],
        queryFn: () => apiFetch<GroupDeadline[]>(ENDPOINTS.groups.deadlines(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    recentFiles: (id: number) => ({
        queryKey: ["groups", id, "files", "recent"],
        queryFn: () => apiFetch<FileItem[]>(ENDPOINTS.groups.recentFiles(id), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    schedule: (id: number, from: string, to: string) => ({
        queryKey: ["groups", id, "schedule", from, to],
        queryFn: () => apiFetch<GroupScheduleItem[]>(ENDPOINTS.groups.schedule(id, from, to), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    files: (id: number, folderId?: number | null, groupSubjectId?: number | null) => ({
        queryKey: ["groups", id, "files", folderId ?? "root", groupSubjectId ?? "all"],
        queryFn: () => apiFetch<FileItem[]>(ENDPOINTS.groups.files(id, folderId, groupSubjectId), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    folders: (id: number, parentId?: number | null, groupSubjectId?: number | null) => ({
        queryKey: ["groups", id, "folders", parentId ?? null, groupSubjectId ?? null],
        queryFn: () => apiFetch<FolderItem[]>(ENDPOINTS.groups.folders(id, parentId, groupSubjectId), { cacheTtlMs: 30_000 }),
        staleTime: 30_000,
    }),
    create: (payload: CreateGroupPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<Group>(ENDPOINTS.groups.create, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    join: (payload: JoinGroupPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupMember>(ENDPOINTS.groups.join, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    update: (groupId: number, payload: UpdateGroupPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<Group>(ENDPOINTS.groups.update(groupId), {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
    }),
    createInvite: (groupId: number, payload: CreateGroupInvitePayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupInvite>(ENDPOINTS.groups.invites(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    respondJoinRequest: (groupId: number, joinRequestId: number, status: "approved" | "rejected") => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupJoinRequest>(ENDPOINTS.groups.joinRequest(groupId, joinRequestId), {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),
    }),
    createSubject: (groupId: number, payload: CreateGroupSubjectPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupSubject>(ENDPOINTS.groups.subjects(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    createAnnouncement: (groupId: number, payload: CreateGroupAnnouncementPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupAnnouncement>(ENDPOINTS.groups.announcements(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    acknowledgeAnnouncement: (groupId: number, announcementId: number) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<{ id: number; acknowledgedAt: string | null }>(
            ENDPOINTS.groups.acknowledgeAnnouncement(groupId, announcementId),
            {
                method: "POST",
            },
        ),
    }),
    createDeadline: (groupId: number, payload: CreateGroupDeadlinePayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupDeadline>(ENDPOINTS.groups.deadlines(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    updateDeadlineProgress: (groupId: number, deadlineId: number, status: "not_started" | "in_progress" | "completed") => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<{ status: string; completedAt: string | null }>(
            ENDPOINTS.groups.deadlineProgress(groupId, deadlineId),
            {
                method: "PATCH",
                body: JSON.stringify({ status }),
            },
        ),
    }),
    createChannelMessage: (groupId: number, channelId: number, payload: CreateGroupMessagePayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupMessage>(ENDPOINTS.groups.channelMessages(groupId, channelId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    createFile: (groupId: number, payload: FormData) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<FileItem>(ENDPOINTS.groups.files(groupId), {
            method: "POST",
            body: payload,
        }),
    }),
    createFolder: (groupId: number, payload: CreateGroupFolderPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<FolderItem>(ENDPOINTS.groups.folders(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    createLesson: (groupId: number, payload: CreateGroupLessonPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupScheduleItem>(ENDPOINTS.groups.scheduleLessons(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    createPoll: (groupId: number, payload: CreateGroupPollPayload) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupPoll>(ENDPOINTS.groups.polls(groupId), {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    }),
    votePoll: (groupId: number, pollId: number, optionIds: number[]) => ({
        queryKey: [] as const,
        queryFn: () => apiFetch<GroupPoll>(ENDPOINTS.groups.votePoll(groupId, pollId), {
            method: "POST",
            body: JSON.stringify({ optionIds }),
        }),
    }),
};
