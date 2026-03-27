import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownToLineIcon, PlusIcon } from "lucide-react";

import {
    useCreateGroupDeadline,
    useUpdateGroupDeadlineProgress,
} from "@/modules/groups/api/hooks";
import type { GroupDeadline, GroupSubject } from "@/modules/groups/model/types";
import { useDeadlines } from "@/modules/deadlines/api/hooks";
import type { Deadline } from "@/modules/deadlines/model/types";
import { DeadlinePriorityBadge } from "@/modules/deadlines/ui/deadline-priority-badge";
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

import { GroupSelect } from "../shared/group-select";
import { EmptyState, Field, SectionHeader, groupTextAreaClassName } from "../shared/ui";
import { formatDateTime } from "../shared/utils";
import type { GroupRole } from "../shared/view";

interface GroupDeadlinesSectionProps {
    groupId: number;
    deadlines: GroupDeadline[];
    subjects: GroupSubject[];
    canManage: boolean;
    requiredRole: GroupRole;
}

const PRIORITY_OPTIONS = [
    { value: "low", label: "Низький" },
    { value: "medium", label: "Середній" },
    { value: "high", label: "Високий" },
    { value: "critical", label: "Критичний" },
];

const TYPE_OPTIONS = [
    { value: "homework", label: "Домашнє" },
    { value: "lab", label: "Лабораторна" },
    { value: "practice", label: "Практика" },
    { value: "other", label: "Інше" },
];

const INITIAL_FORM = {
    groupSubjectId: "",
    title: "",
    description: "",
    priority: "medium",
    type: "homework",
    dueAt: "",
};

export function GroupDeadlinesSection({
    groupId,
    deadlines,
    subjects,
    canManage,
}: GroupDeadlinesSectionProps) {
    const createGroupDeadline = useCreateGroupDeadline();
    const updateProgress = useUpdateGroupDeadlineProgress();
    const { data: personalDeadlines = [] } = useDeadlines();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [subjectMapping, setSubjectMapping] = useState<Record<number, string>>({});

    const subjectOptions = useMemo(
        () =>
            subjects.map((subject) => ({
                value: subject.id.toString(),
                label: subject.name,
                description: subject.teacherName ?? undefined,
            })),
        [subjects],
    );

    useEffect(() => {
        if (!subjects.length) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubjectMapping((current) => {
            const next = { ...current };

            for (const deadline of personalDeadlines) {
                if (next[deadline.subjectId]) continue;

                const match = subjects.find((subject) =>
                    deadline.title.toLowerCase().includes(subject.name.toLowerCase()),
                );

                if (match) next[deadline.subjectId] = match.id.toString();
            }

            return next;
        });
    }, [personalDeadlines, subjects]);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await createGroupDeadline.mutateAsync({
            groupId,
            payload: {
                groupSubjectId: form.groupSubjectId ? Number(form.groupSubjectId) : undefined,
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                priority: form.priority,
                type: form.type,
                dueAt: new Date(form.dueAt).toISOString(),
            },
        });

        setForm(INITIAL_FORM);
        setIsCreateOpen(false);
    }

    async function handleImport() {
        for (const deadlineId of selectedIds) {
            const deadline = personalDeadlines.find((item) => item.id === deadlineId);
            if (!deadline) continue;

            await createGroupDeadline.mutateAsync({
                groupId,
                payload: {
                    groupSubjectId: subjectMapping[deadline.subjectId]
                        ? Number(subjectMapping[deadline.subjectId])
                        : undefined,
                    title: deadline.title,
                    description: deadline.description ?? undefined,
                    priority: deadline.priority,
                    type: deadline.type,
                    dueAt: deadline.dueAt,
                },
            });
        }

        setSelectedIds([]);
        setIsImportOpen(false);
    }

    return (
        <div>
            <SectionHeader
                eyebrow="Deadlines"
                title="Дедлайни"
                actions={
                    canManage ? (
                        <>
                            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                                <ArrowDownToLineIcon className="size-4" />
                                Імпорт із моїх дедлайнів
                            </Button>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <PlusIcon className="size-4" />
                                Додати дедлайн
                            </Button>
                        </>
                    ) : null
                }
            />

            <div className="space-y-4 p-4 md:p-6">
                {deadlines.length ? (
                    <div className="space-y-3">
                        {deadlines.map((deadline) => (
                            <Card key={deadline.id} className="border-border/70">
                                <CardContent className="space-y-3 p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="text-lg font-semibold text-foreground">
                                                {deadline.title}
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {deadline.subject?.name || "Без предмета"} ·{" "}
                                                {formatDateTime(deadline.dueAt)}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <DeadlinePriorityBadge
                                                priority={deadline.priority as never}
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    updateProgress.mutateAsync({
                                                        groupId,
                                                        deadlineId: deadline.id,
                                                        status:
                                                            deadline.myStatus?.status === "completed"
                                                                ? "in_progress"
                                                                : "completed",
                                                    })
                                                }
                                            >
                                                {deadline.myStatus?.status === "completed"
                                                    ? "Повернути в роботу"
                                                    : "Позначити виконаним"}
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {deadline.description || "Без опису"}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Дедлайнів ще немає"
                        description="Ви можете підтягнути вже наявні дедлайни зі свого списку або створити новий вручну."
                    />
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Новий дедлайн</DialogTitle>
                        <DialogDescription>
                            Дедлайн створюється окремо від списку та не змішується з переглядом поточних задач.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleCreate}>
                        <Field label="Предмет">
                            <GroupSelect
                                value={form.groupSubjectId}
                                onChange={(value) =>
                                    setForm((current) => ({ ...current, groupSubjectId: value }))
                                }
                                options={subjectOptions}
                                placeholder="Оберіть предмет"
                            />
                        </Field>

                        <Field label="Назва">
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

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Тип">
                                <GroupSelect
                                    value={form.type}
                                    onChange={(value) =>
                                        setForm((current) => ({ ...current, type: value }))
                                    }
                                    options={TYPE_OPTIONS}
                                />
                            </Field>

                            <Field label="Пріоритет">
                                <GroupSelect
                                    value={form.priority}
                                    onChange={(value) =>
                                        setForm((current) => ({
                                            ...current,
                                            priority: value,
                                        }))
                                    }
                                    options={PRIORITY_OPTIONS}
                                />
                            </Field>
                        </div>

                        <Field label="Термін">
                            <Input
                                type="datetime-local"
                                value={form.dueAt}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        dueAt: event.target.value,
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

                        <DialogFooter>
                            <Button type="submit" disabled={createGroupDeadline.isPending}>
                                Створити дедлайн
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Імпорт дедлайнів</DialogTitle>
                        <DialogDescription>
                            Виберіть дедлайни зі свого особистого списку та за потреби вкажіть мапінг на груповий предмет.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {personalDeadlines.length ? (
                            personalDeadlines.map((deadline: Deadline) => (
                                <div
                                    key={deadline.id}
                                    className="rounded-2xl border border-border/70 p-4"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(deadline.id)}
                                                onChange={(event) =>
                                                    setSelectedIds((current) =>
                                                        event.target.checked
                                                            ? [...current, deadline.id]
                                                            : current.filter(
                                                                  (item) =>
                                                                      item !== deadline.id,
                                                              ),
                                                    )
                                                }
                                            />
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {deadline.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDateTime(deadline.dueAt)}
                                                </div>
                                            </div>
                                        </label>

                                        <div className="md:w-72">
                                            <GroupSelect
                                                value={subjectMapping[deadline.subjectId] ?? ""}
                                                onChange={(value) =>
                                                    setSubjectMapping((current) => ({
                                                        ...current,
                                                        [deadline.subjectId]: value,
                                                    }))
                                                }
                                                options={subjectOptions}
                                                placeholder="Мапінг на предмет групи"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                title="Немає дедлайнів для імпорту"
                                description="Спочатку створіть особисті дедлайни або поверніться пізніше."
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleImport}
                            disabled={!selectedIds.length || createGroupDeadline.isPending}
                        >
                            Імпортувати дедлайни
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
