import { useMemo, useState, type FormEvent } from "react";
import { CopyIcon, LinkIcon, ShieldIcon, UserCheckIcon } from "lucide-react";

import {
    useCreateGroupInvite,
    useRespondToGroupJoinRequest,
    useRevokeGroupInvite,
} from "@/modules/groups/api/hooks";
import type { GroupInvite, GroupJoinRequest, GroupMember } from "@/modules/groups/model/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { DateTimeInput } from "@/shared/ui/date-time-input";

import { EmptyState, Field, RoleBadge, SectionHeader } from "../shared/ui";
import { formatDateTime } from "../shared/utils";
import type { GroupRole } from "../shared/view";

interface GroupMembersSectionProps {
    groupId: number;
    members: GroupMember[];
    invites: GroupInvite[];
    joinRequests: GroupJoinRequest[];
    canInvite: boolean;
    requiredRole: GroupRole;
}

const INITIAL_INVITE_FORM = {
    maxUses: "",
    expiresAt: "",
};

function initials(member: GroupMember) {
    return `${member.user?.firstName?.[0] ?? ""}${member.user?.lastName?.[0] ?? ""}`.trim() || "?";
}

export function GroupMembersSection({
    groupId,
    members,
    invites,
    joinRequests,
    canInvite,
}: GroupMembersSectionProps) {
    const createInvite = useCreateGroupInvite();
    const revokeInvite = useRevokeGroupInvite();
    const respondJoinRequest = useRespondToGroupJoinRequest();

    const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState(INITIAL_INVITE_FORM);

    const activeInvites = useMemo(
        () => invites.filter((invite) => invite.status === "active"),
        [invites],
    );

    async function handleCreateInvite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await createInvite.mutateAsync({
            groupId,
            payload: {
                maxUses: inviteForm.maxUses ? Number(inviteForm.maxUses) : undefined,
                expiresAt: inviteForm.expiresAt || undefined,
            },
        });

        setInviteForm(INITIAL_INVITE_FORM);
        setIsCreateInviteOpen(false);
    }

    return (
        <div>
            <SectionHeader
                eyebrow="Members"
                title="Учасники"
                actions={
                    canInvite ? (
                        <Button onClick={() => setIsCreateInviteOpen(true)}>
                            <LinkIcon className="size-4" />
                            Створити інвайт
                        </Button>
                    ) : null
                }
            />

            <div className="space-y-6 p-4 md:p-6">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        {members.length ? (
                            members.map((member) => (
                                <Card key={member.id} className="border-border/70">
                                    <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-12">
                                                <AvatarImage src={member.user?.avatarPath ?? undefined} />
                                                <AvatarFallback>{initials(member)}</AvatarFallback>
                                            </Avatar>

                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold text-foreground">
                                                    {member.user
                                                        ? `${member.user.firstName} ${member.user.lastName ?? ""}`.trim()
                                                        : "Користувач"}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    @{member.user?.username || "unknown"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <RoleBadge role={member.role} />
                                            {member.subgroup ? (
                                                <Badge variant="outline">
                                                    Підгрупа {member.subgroup}
                                                </Badge>
                                            ) : null}
                                            <Badge variant="outline">{member.status}</Badge>
                                            <span className="text-muted-foreground">
                                                {formatDateTime(member.joinedAt)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <EmptyState
                                title="Учасників не знайдено"
                                description="Після вступу або схвалення запитів тут з'явиться склад групи."
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card className="border-border/70">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <ShieldIcon className="size-4 text-primary" />
                                    Активні інвайти
                                </div>

                                {activeInvites.length ? (
                                    <div className="space-y-3">
                                        {activeInvites.map((invite) => (
                                            <div
                                                key={invite.id}
                                                className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {invite.code}
                                                        </div>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            Використано {invite.usesCount}
                                                            {invite.maxUses
                                                                ? ` / ${invite.maxUses}`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">{invite.status}</Badge>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            navigator.clipboard.writeText(
                                                                invite.token || invite.code,
                                                            )
                                                        }
                                                    >
                                                        <CopyIcon className="size-4" />
                                                        Скопіювати
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            revokeInvite.mutateAsync({
                                                                groupId,
                                                                inviteId: invite.id,
                                                            })
                                                        }
                                                    >
                                                        Відкликати
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Активних інвайтів немає"
                                        description="Нові інвайти створюються окремо й відображаються тут списком."
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <UserCheckIcon className="size-4 text-primary" />
                                    Запити на вступ
                                </div>

                                {joinRequests.length ? (
                                    <div className="space-y-3">
                                        {joinRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3"
                                            >
                                                <div className="font-medium text-foreground">
                                                    {request.user
                                                        ? `${request.user.firstName} ${request.user.lastName ?? ""}`.trim()
                                                        : "Користувач"}
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    @{request.user?.username || "unknown"}
                                                </div>
                                                {request.message ? (
                                                    <p className="mt-3 text-sm text-muted-foreground">
                                                        {request.message}
                                                    </p>
                                                ) : null}
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            respondJoinRequest.mutateAsync({
                                                                groupId,
                                                                joinRequestId: request.id,
                                                                status: "approved",
                                                            })
                                                        }
                                                    >
                                                        Схвалити
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            respondJoinRequest.mutateAsync({
                                                                groupId,
                                                                joinRequestId: request.id,
                                                                status: "rejected",
                                                            })
                                                        }
                                                    >
                                                        Відхилити
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Запитів немає"
                                        description="Нові заявки на вступ відобразяться в цій секції."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={isCreateInviteOpen} onOpenChange={setIsCreateInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Створити інвайт</DialogTitle>
                        <DialogDescription>
                            Інвайт створюється окремо від списку учасників і зберігається в блоці активних кодів.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleCreateInvite}>
                        <Field label="Ліміт використань">
                            <Input
                                type="number"
                                min={1}
                                value={inviteForm.maxUses}
                                onChange={(event) =>
                                    setInviteForm((current) => ({
                                        ...current,
                                        maxUses: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                                placeholder="Без ліміту"
                            />
                        </Field>

                        <Field label="Дійсний до">
                            <DateTimeInput
                                value={inviteForm.expiresAt}
                                onChange={(value) =>
                                    setInviteForm((current) => ({
                                        ...current,
                                        expiresAt: value,
                                    }))
                                }
                                dateInputClassName="h-10 rounded-xl"
                                timeInputClassName="h-10 rounded-xl"
                            />
                        </Field>

                        <DialogFooter>
                            <Button type="submit" disabled={createInvite.isPending}>
                                Створити інвайт
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
