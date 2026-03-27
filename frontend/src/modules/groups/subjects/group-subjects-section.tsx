import { useMemo, useState, type FormEvent } from "react";
import { ImportIcon, PlusIcon } from "lucide-react";

import { useCreateGroupSubject } from "@/modules/groups/api/hooks";
import type { GroupSubject } from "@/modules/groups/model/types";
import { useSubjects } from "@/modules/subjects/api/hooks";
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

import { EmptyState, Field, SectionHeader, groupTextAreaClassName } from "../shared/ui";
import { GroupColorPicker } from "../shared/group-color-picker";
import type { GroupRole } from "../shared/view";

interface GroupSubjectsSectionProps {
    groupId: number;
    subjects: GroupSubject[];
    canManage: boolean;
    requiredRole: GroupRole;
}

const INITIAL_FORM = {
    name: "",
    teacherName: "",
    color: "#2563eb",
    description: "",
};

export function GroupSubjectsSection({
    groupId,
    subjects,
    canManage,
}: GroupSubjectsSectionProps) {
    const createGroupSubject = useCreateGroupSubject();
    const { data: personalSubjects = [] } = useSubjects();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const existingNames = useMemo(
        () => new Set(subjects.map((subject) => subject.name.trim().toLowerCase())),
        [subjects],
    );

    const importableSubjects = useMemo(
        () =>
            personalSubjects.filter(
                (subject) => !existingNames.has(subject.name.trim().toLowerCase()),
            ),
        [existingNames, personalSubjects],
    );

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await createGroupSubject.mutateAsync({
            groupId,
            payload: {
                name: form.name.trim(),
                teacherName: form.teacherName.trim() || undefined,
                color: form.color,
                description: form.description.trim() || undefined,
            },
        });

        setForm(INITIAL_FORM);
        setIsCreateOpen(false);
    }

    async function handleImport() {
        for (const subjectId of selectedIds) {
            const subject = personalSubjects.find((item) => item.id === subjectId);
            if (!subject) continue;

            await createGroupSubject.mutateAsync({
                groupId,
                payload: {
                    name: subject.name,
                    teacherName: subject.teacherName ?? undefined,
                    color: subject.color ?? undefined,
                },
            });
        }

        setSelectedIds([]);
        setIsImportOpen(false);
    }

    return (
        <div>
            <SectionHeader
                eyebrow="Subjects"
                title="Предмети"
                actions={
                    canManage ? (
                        <>
                            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                                <ImportIcon className="size-4" />
                                Імпорт із моїх предметів
                            </Button>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <PlusIcon className="size-4" />
                                Додати вручну
                            </Button>
                        </>
                    ) : null
                }
            />

            <div className="space-y-4 p-2 md:p-6">
                {subjects.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {subjects.map((subject) => (
                            <Card key={subject.id} className="border-border/70">
                                <CardContent className="space-y-3 px-5">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="size-3 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    subject.color ?? "#2563eb",
                                            }}
                                        />
                                        <div className="text-base font-semibold text-foreground">
                                            {subject.name}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {subject.teacherName || "Викладача не вказано"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {subject.description || "Без опису"}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Предметів ще немає"
                        description="Додайте новий предмет вручну або підтягніть його зі своїх вже наявних предметів."
                        action={
                            canManage ? (
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                                        Імпорт із моїх предметів
                                    </Button>
                                    <Button onClick={() => setIsCreateOpen(true)}>
                                        Додати вручну
                                    </Button>
                                </div>
                            ) : undefined
                        }
                    />
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Новий предмет</DialogTitle>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleCreate}>
                        <Field label="Назва">
                            <Input
                                required
                                value={form.name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Викладач">
                            <Input
                                value={form.teacherName}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        teacherName: event.target.value,
                                    }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Колір">
                            <GroupColorPicker
                                value={form.color}
                                onChange={(color) =>
                                    setForm((current) => ({ ...current, color }))
                                }
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
                            <Button type="submit" disabled={createGroupSubject.isPending}>
                                Створити предмет
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Імпорт предметів</DialogTitle>
                        <DialogDescription>
                            Виберіть предмети, які вже існують у вас, щоб не дублювати їх вручну.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {importableSubjects.length ? (
                            importableSubjects.map((subject) => {
                                const checked = selectedIds.includes(subject.id);

                                return (
                                    <label
                                        key={subject.id}
                                        className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(event) =>
                                                setSelectedIds((current) =>
                                                    event.target.checked
                                                        ? [...current, subject.id]
                                                        : current.filter(
                                                              (id) => id !== subject.id,
                                                          ),
                                                )
                                            }
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground">
                                                {subject.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {subject.teacherName || "Викладача не вказано"}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })
                        ) : (
                            <EmptyState
                                title="Немає що імпортувати"
                                description="Усі наявні предмети вже присутні в цій групі або персональних предметів ще немає."
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleImport}
                            disabled={!selectedIds.length || createGroupSubject.isPending}
                        >
                            Імпортувати вибране
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
