import { useState, type FormEvent } from "react";
import { MegaphoneIcon, PinIcon, PlusIcon } from "lucide-react";

import {
    useAcknowledgeGroupAnnouncement,
    useCreateGroupAnnouncement,
} from "@/modules/groups/api/hooks";
import type { GroupAnnouncement } from "@/modules/groups/model/types";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";

import {
    EmptyState,
    Field,
    SectionHeader,
    groupTextAreaClassName,
} from "../shared/ui";
import { formatDateTime } from "../shared/utils";
import type { GroupRole } from "../shared/view";

interface GroupAnnouncementsSectionProps {
    groupId: number;
    announcements: GroupAnnouncement[];
    canPost: boolean;
    requiredRole: GroupRole;
}

const INITIAL_FORM = {
    title: "",
    content: "",
    type: "organizational",
    deadlineAt: "",
    isPinned: false,
    requiresAcknowledgement: false,
};

export function GroupAnnouncementsSection({
    groupId,
    announcements,
    canPost,
}: GroupAnnouncementsSectionProps) {
    const createAnnouncement = useCreateGroupAnnouncement();
    const acknowledgeAnnouncement = useAcknowledgeGroupAnnouncement();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await createAnnouncement.mutateAsync({
            groupId,
            payload: {
                title: form.title.trim(),
                content: form.content.trim(),
                type: form.type,
                deadlineAt: form.deadlineAt || undefined,
                isPinned: form.isPinned,
                requiresAcknowledgement: form.requiresAcknowledgement,
            },
        });

        setForm(INITIAL_FORM);
        setIsCreateOpen(false);
    }

    return (
        <div>
            <SectionHeader
                eyebrow="Announcements"
                title="Оголошення"
                actions={
                    canPost ? (
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="size-4" />
                            Створити оголошення
                        </Button>
                    ) : null
                }
            />

            <div className="space-y-4 p-4 md:p-6">
                {announcements.length ? (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className="border-border/70">
                                <CardContent className="space-y-3 p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {announcement.title}
                                                </h3>
                                                {announcement.isPinned ? (
                                                    <Badge variant="outline">
                                                        <PinIcon className="mr-1 size-3" />
                                                        Закріплено
                                                    </Badge>
                                                ) : null}
                                                {announcement.requiresAcknowledgement ? (
                                                    <Badge variant="outline">
                                                        Потрібне підтвердження
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <span className="inline-flex items-center gap-1">
                                                    <MegaphoneIcon className="size-4" />
                                                    {announcement.type}
                                                </span>
                                                <span>{formatDateTime(announcement.createdAt)}</span>
                                                {announcement.creator ? (
                                                    <span>
                                                        {announcement.creator.firstName}{" "}
                                                        {announcement.creator.lastName ?? ""}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        {announcement.requiresAcknowledgement &&
                                        !announcement.acknowledged ? (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    acknowledgeAnnouncement.mutateAsync({
                                                        groupId,
                                                        announcementId: announcement.id,
                                                    })
                                                }
                                            >
                                                Підтвердити
                                            </Button>
                                        ) : null}
                                    </div>

                                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                        {announcement.content}
                                    </p>

                                    {announcement.deadlineAt ? (
                                        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                            Дедлайн підтвердження:{" "}
                                            <span className="font-medium text-foreground">
                                                {formatDateTime(announcement.deadlineAt)}
                                            </span>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Оголошень ще немає"
                        description="Секція показує лише опубліковані оголошення."
                        action={
                            canPost ? (
                                <Button onClick={() => setIsCreateOpen(true)}>
                                    Створити перше оголошення
                                </Button>
                            ) : undefined
                        }
                    />
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Нове оголошення</DialogTitle>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Field label="Заголовок">
                            <Input
                                required
                                value={form.title}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        title: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Тип">
                            <Input
                                value={form.type}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        type: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Текст">
                            <textarea
                                required
                                value={form.content}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        content: event.target.value,
                                    }))
                                }
                                className={groupTextAreaClassName}
                            />
                        </Field>

                        <Field label="Дедлайн підтвердження">
                            <Input
                                type="datetime-local"
                                value={form.deadlineAt}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        deadlineAt: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.isPinned}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            isPinned: event.target.checked,
                                        }))
                                    }
                                />
                                Закріпити оголошення
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.requiresAcknowledgement}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            requiresAcknowledgement:
                                                event.target.checked,
                                        }))
                                    }
                                />
                                Вимагати підтвердження
                            </label>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={createAnnouncement.isPending}>
                                Опублікувати
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
