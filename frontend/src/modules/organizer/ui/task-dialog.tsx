import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { useCreateTask, useUpdateTask } from "../api";
import { taskCategoryOptions } from "../lib/category-registry";
import { toDateTimeInputValue, toIsoFromDateTimeInput } from "../lib/utils";
import type { Task, TaskPayload, TaskPriority, TaskStatus } from "../model/types";
import { Button } from "@/shared/shadcn/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { Textarea } from "@/shared/shadcn/ui/textarea";

const selectClassName = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    defaultStatus?: TaskStatus;
}

const emptyState: TaskPayload = {
    title: "",
    description: null,
    category: "study",
    priority: "medium",
    status: "todo",
    dueAt: null,
};

export function TaskDialog({ open, onOpenChange, task, defaultStatus = "todo" }: Props) {
    const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();
    const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask();
    const [form, setForm] = useState<TaskPayload>(emptyState);

    useEffect(() => {
        if (!open) return;
        if (task) {
            setForm({
                title: task.title,
                description: task.description,
                category: task.category,
                priority: task.priority,
                status: task.status,
                dueAt: task.dueAt,
            });
            return;
        }

        setForm({
            ...emptyState,
            status: defaultStatus,
        });
    }, [defaultStatus, open, task]);

    const isPending = isCreating || isUpdating;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload: TaskPayload = {
            title: form.title.trim(),
            description: form.description?.trim() ? form.description.trim() : null,
            category: form.category,
            priority: form.priority,
            status: form.status,
            dueAt: form.dueAt,
        };

        if (!payload.title) return;

        if (task) {
            await updateTask({
                id: task.id,
                payload,
            });
        } else {
            await createTask(payload);
        }

        onOpenChange(false);
    }

    function setSelectValue<K extends "category" | "priority" | "status">(key: K, value: TaskPayload[K]) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{task ? "Редагувати задачу" : "Нова задача"}</DialogTitle>
                    <DialogDescription>
                        Особистий To-do працює окремо від навчальних дедлайнів.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="task-title">Назва</Label>
                        <Input
                            id="task-title"
                            value={form.title}
                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                            placeholder="Наприклад, підготувати блок тем до семінару"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task-description">Опис</Label>
                        <Textarea
                            id="task-description"
                            value={form.description ?? ""}
                            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            placeholder="Деталі, чекпоїнти або контекст"
                            className="min-h-28"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="task-category">Категорія</Label>
                            <select
                                id="task-category"
                                className={selectClassName}
                                value={form.category}
                                onChange={(event) => setSelectValue("category", event.target.value as TaskPayload["category"])}
                            >
                                {taskCategoryOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="task-priority">Пріоритет</Label>
                            <select
                                id="task-priority"
                                className={selectClassName}
                                value={form.priority}
                                onChange={(event) => setSelectValue("priority", event.target.value as TaskPriority)}
                            >
                                <option value="low">Низький</option>
                                <option value="medium">Середній</option>
                                <option value="high">Високий</option>
                                <option value="critical">Критичний</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="task-status">Статус</Label>
                            <select
                                id="task-status"
                                className={selectClassName}
                                value={form.status}
                                onChange={(event) => setSelectValue("status", event.target.value as TaskStatus)}
                            >
                                <option value="todo">To-do</option>
                                <option value="in_progress">В роботі</option>
                                <option value="done">Готово</option>
                                <option value="cancelled">Скасовано</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task-due-at">Дедлайн</Label>
                        <Input
                            id="task-due-at"
                            type="datetime-local"
                            value={toDateTimeInputValue(form.dueAt)}
                            onChange={(event) => setForm((current) => ({
                                ...current,
                                dueAt: toIsoFromDateTimeInput(event.target.value),
                            }))}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                            {task ? "Зберегти" : "Створити"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
