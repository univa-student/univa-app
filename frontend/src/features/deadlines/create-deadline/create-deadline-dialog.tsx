import { useState } from "react";
import { format } from "date-fns";

import { useCreateDeadline } from "@/entities/deadline/api/hooks";
import type { DeadlinePriority, DeadlineType } from "@/entities/deadline/model/types";
import { typeConfig } from "@/shared/ui/deadlines/deadline-type-icon";
import { priorityConfig } from "@/shared/ui/deadlines/deadline-priority-badge";

import { Button } from "@/shared/shadcn/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prefillSubjectId?: number;
    subjects: { id: number; name: string }[];
}

export function CreateDeadlineDialog({ open, onOpenChange, prefillSubjectId, subjects }: Props) {
    const { mutateAsync: createDeadline, isPending } = useCreateDeadline();

    const [subjectId, setSubjectId] = useState<number>(prefillSubjectId || 0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<DeadlineType>("homework");
    const [priority, setPriority] = useState<DeadlinePriority>("medium");
    const [dueAt, setDueAt] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [dueTime, setDueTime] = useState<string>("23:59");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !subjectId || !dueAt) return;

        const date = new Date(dueAt);
        const [hours, minutes] = dueTime.split(":").map(Number);
        date.setHours(hours ?? 23, minutes ?? 59, 59, 0);

        try {
            await createDeadline({
                subjectId: subjectId,
                title: title.trim(),
                description: description.trim() || null,
                type,
                priority,
                dueAt: date.toISOString(),
                status: "new",
                completedAt: null,
            });

            // Reset form
            setTitle("");
            setDescription("");
            setSubjectId(prefillSubjectId || 0);
            setType("homework");
            setPriority("medium");

            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create deadline", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Новий дедлайн</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Назва</Label>
                        <Input
                            id="title"
                            placeholder="Наприклад: Звіт з лаби №1"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject_id">Предмет</Label>
                        <select
                            id="subject_id"
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={subjectId}
                            onChange={e => setSubjectId(Number(e.target.value))}
                            required
                        >
                            <option value={0} disabled>Оберіть предмет</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Тип роботи</Label>
                            <select
                                id="type"
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                                value={type}
                                onChange={e => setType(e.target.value as DeadlineType)}
                            >
                                {Object.entries(typeConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Пріоритет</Label>
                            <select
                                id="priority"
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                                value={priority}
                                onChange={e => setPriority(e.target.value as DeadlinePriority)}
                            >
                                {Object.entries(priorityConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="due_at">Дата здачі</Label>
                            <Input
                                id="due_at"
                                type="date"
                                value={dueAt}
                                onChange={e => setDueAt(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_time">Час</Label>
                            <Input
                                id="due_time"
                                type="time"
                                value={dueTime}
                                onChange={e => setDueTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Опис (опціонально)</Label>
                        <textarea
                            id="description"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Деталі завдання..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending || !title || !subjectId}>
                            {isPending ? "Збереження..." : "Створити"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
