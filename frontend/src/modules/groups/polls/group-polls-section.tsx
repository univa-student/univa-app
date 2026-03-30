import { useState, type FormEvent } from "react";
import { BarChart3Icon, PlusIcon, Trash2Icon } from "lucide-react";

import { useCreateGroupPoll, useVoteGroupPoll } from "@/modules/groups/api/hooks";
import type { GroupPoll } from "@/modules/groups/model/types";
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

import {
    EmptyState,
    Field,
    SectionHeader,
    groupTextAreaClassName,
} from "../shared/ui";
import { formatDateTime } from "../shared/utils";
import type { GroupRole } from "../shared/view";

interface GroupPollsSectionProps {
    groupId: number;
    polls: GroupPoll[];
    canCreate: boolean;
    requiredRole: GroupRole;
}

const INITIAL_FORM = {
    title: "",
    description: "",
    closesAt: "",
    allowsMultiple: false,
    isAnonymous: false,
    showResults: true,
    options: ["", ""],
};

export function GroupPollsSection({
    groupId,
    polls,
    canCreate,
}: GroupPollsSectionProps) {
    const createPoll = useCreateGroupPoll();
    const votePoll = useVoteGroupPoll();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedVotes, setSelectedVotes] = useState<Record<number, number[]>>({});

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = form.options
            .map((label, index) => ({ label: label.trim(), position: index + 1 }))
            .filter((option) => option.label.length > 0);

        if (options.length < 2) return;

        await createPoll.mutateAsync({
            groupId,
            payload: {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                closesAt: form.closesAt || undefined,
                allowsMultiple: form.allowsMultiple,
                isAnonymous: form.isAnonymous,
                showResults: form.showResults,
                options,
            },
        });

        setForm(INITIAL_FORM);
        setIsCreateOpen(false);
    }

    function toggleOption(pollId: number, optionId: number, multiple: boolean) {
        setSelectedVotes((current) => {
            const currentSelection = current[pollId] ?? [];

            if (!multiple) {
                return { ...current, [pollId]: [optionId] };
            }

            const next = currentSelection.includes(optionId)
                ? currentSelection.filter((id) => id !== optionId)
                : [...currentSelection, optionId];

            return { ...current, [pollId]: next };
        });
    }

    return (
        <div>
            <SectionHeader
                eyebrow="Polls"
                title="Опитування"
                actions={
                    canCreate ? (
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="size-4" />
                            Створити опитування
                        </Button>
                    ) : null
                }
            />

            <div className="space-y-4 p-4 md:p-6">
                {polls.length ? (
                    <div className="space-y-4">
                        {polls.map((poll) => {
                            const currentSelection = selectedVotes[poll.id] ?? [];

                            return (
                                <Card key={poll.id} className="border-border/70">
                                    <CardContent className="space-y-4 p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {poll.title}
                                                    </h3>
                                                    <Badge variant="outline">
                                                        {poll.status === "open"
                                                            ? "Відкрите"
                                                            : "Закрите"}
                                                    </Badge>
                                                    {poll.allowsMultiple ? (
                                                        <Badge variant="outline">
                                                            Мультивибір
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                {poll.description ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        {poll.description}
                                                    </p>
                                                ) : null}
                                            </div>

                                            {poll.closesAt ? (
                                                <div className="text-sm text-muted-foreground">
                                                    До {formatDateTime(poll.closesAt)}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="space-y-3">
                                            {(poll.options ?? []).map((option) => {
                                                const checked =
                                                    currentSelection.includes(option.id) ||
                                                    option.votedByMe;

                                                return (
                                                    <label
                                                        key={option.id}
                                                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type={
                                                                    poll.allowsMultiple
                                                                        ? "checkbox"
                                                                        : "radio"
                                                                }
                                                                checked={checked}
                                                                onChange={() =>
                                                                    toggleOption(
                                                                        poll.id,
                                                                        option.id,
                                                                        poll.allowsMultiple,
                                                                    )
                                                                }
                                                                name={`poll-${poll.id}`}
                                                                disabled={
                                                                    poll.status !== "open"
                                                                }
                                                            />
                                                            <span className="text-sm text-foreground">
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            {option.votesCount}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {poll.status === "open" ? (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    votePoll.mutateAsync({
                                                        groupId,
                                                        pollId: poll.id,
                                                        optionIds: currentSelection,
                                                    })
                                                }
                                                disabled={!currentSelection.length}
                                            >
                                                <BarChart3Icon className="size-4" />
                                                Надіслати голос
                                            </Button>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        title="Опитувань ще немає"
                        description="Стрічка показує лише вже створені опитування. Нова форма відкривається окремо."
                        action={
                            canCreate ? (
                                <Button onClick={() => setIsCreateOpen(true)}>
                                    Створити опитування
                                </Button>
                            ) : undefined
                        }
                    />
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Нове опитування</DialogTitle>
                        <DialogDescription>
                            Окрема create-flow форма без змішування зі списком.
                        </DialogDescription>
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

                        <Field label="Опис">
                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                                className={groupTextAreaClassName}
                            />
                        </Field>

                        <Field label="Закрити о">
                            <Input
                                type="datetime-local"
                                value={form.closesAt}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        closesAt: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    Варіанти відповіді
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            options: [...current.options, ""],
                                        }))
                                    }
                                >
                                    <PlusIcon className="size-4" />
                                    Додати варіант
                                </Button>
                            </div>

                            {form.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        required={index < 2}
                                        value={option}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                options: current.options.map((item, itemIndex) =>
                                                    itemIndex === index
                                                        ? event.target.value
                                                        : item,
                                                ),
                                            }))
                                        }
                                        className="h-10 rounded-xl"
                                        placeholder={`Варіант ${index + 1}`}
                                    />
                                    {form.options.length > 2 ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setForm((current) => ({
                                                    ...current,
                                                    options: current.options.filter(
                                                        (_, itemIndex) =>
                                                            itemIndex !== index,
                                                    ),
                                                }))
                                            }
                                        >
                                            <Trash2Icon className="size-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <label className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.allowsMultiple}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            allowsMultiple: event.target.checked,
                                        }))
                                    }
                                />
                                Мультивибір
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.isAnonymous}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            isAnonymous: event.target.checked,
                                        }))
                                    }
                                />
                                Анонімне
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.showResults}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            showResults: event.target.checked,
                                        }))
                                    }
                                />
                                Показувати результати
                            </label>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={createPoll.isPending}>
                                Створити
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
