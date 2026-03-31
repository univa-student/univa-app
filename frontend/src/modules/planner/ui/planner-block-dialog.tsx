import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LoaderCircleIcon, Trash2Icon } from "lucide-react";
import type { Deadline } from "@/modules/deadlines/model/types";
import type { Task } from "@/modules/organizer/model/types";
import type { Subject } from "@/modules/subjects/model/types";
import type { PlannerBlock, PlannerBlockPayload, PlannerBlockStatus, PlannerBlockType, PlannerEnergyLevel } from "../model/types";
import { isoToDateParts, toIsoFromDateAndTime } from "../lib/planner-time";
import { Button } from "@/shared/shadcn/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { DateInput, TimeInput } from "@/shared/ui/date-time-input";

const selectClassName = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface PlannerBlockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    block?: PlannerBlock | null;
    prefill?: { startAt: string; endAt: string } | null;
    tasks: Task[];
    deadlines: Deadline[];
    subjects: Subject[];
    onSubmit: (payload: PlannerBlockPayload, block?: PlannerBlock | null) => Promise<void>;
    onDelete?: (block: PlannerBlock) => Promise<void>;
    isPending?: boolean;
}

type Draft = {
    title: string;
    description: string;
    type: PlannerBlockType;
    status: PlannerBlockStatus;
    date: string;
    startTime: string;
    endTime: string;
    taskId: number | null;
    deadlineId: number | null;
    subjectId: number | null;
    priority: number | null;
    energyLevel: PlannerEnergyLevel | null;
    isLocked: boolean;
};

function buildDraft(block?: PlannerBlock | null, prefill?: { startAt: string; endAt: string } | null): Draft {
    if (block) {
        const start = isoToDateParts(block.startAt);
        const end = isoToDateParts(block.endAt);

        return {
            title: block.title,
            description: block.description ?? "",
            type: block.type,
            status: block.status,
            date: start.date,
            startTime: start.time,
            endTime: end.time,
            taskId: block.taskId,
            deadlineId: block.deadlineId,
            subjectId: block.subjectId,
            priority: block.priority,
            energyLevel: block.energyLevel,
            isLocked: block.isLocked,
        };
    }

    const start = isoToDateParts(prefill?.startAt ?? new Date().toISOString());
    const end = isoToDateParts(prefill?.endAt ?? new Date(Date.now() + 60 * 60 * 1000).toISOString());

    return {
        title: "",
        description: "",
        type: "manual",
        status: "planned",
        date: start.date,
        startTime: start.time,
        endTime: end.time,
        taskId: null,
        deadlineId: null,
        subjectId: null,
        priority: null,
        energyLevel: null,
        isLocked: false,
    };
}

export function PlannerBlockDialog({
    open,
    onOpenChange,
    block,
    prefill,
    tasks,
    deadlines,
    subjects,
    onSubmit,
    onDelete,
    isPending = false,
}: PlannerBlockDialogProps) {
    const [draft, setDraft] = useState<Draft>(() => buildDraft(block, prefill));

    useEffect(() => {
        if (!open) return;
        setDraft(buildDraft(block, prefill));
    }, [block, open, prefill]);

    const linkedTask = useMemo(() => tasks.find((item) => item.id === draft.taskId) ?? null, [draft.taskId, tasks]);
    const linkedDeadline = useMemo(() => deadlines.find((item) => item.id === draft.deadlineId) ?? null, [deadlines, draft.deadlineId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await onSubmit({
            title: draft.title.trim() || undefined,
            description: draft.description.trim() || null,
            type: draft.type,
            status: draft.status,
            startAt: toIsoFromDateAndTime(draft.date, draft.startTime),
            endAt: toIsoFromDateAndTime(draft.date, draft.endTime),
            taskId: draft.taskId,
            deadlineId: draft.deadlineId,
            subjectId: draft.subjectId,
            priority: draft.priority,
            energyLevel: draft.energyLevel,
            isLocked: draft.isLocked,
        }, block);

        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{block ? "Редагувати planner block" : "Новий planner block"}</DialogTitle>
                    <DialogDescription>
                        Прив’яжіть блок до задачі, дедлайну або предмета, щоб Planner збирав день в одному місці.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="planner-title">Назва</Label>
                            <Input
                                id="planner-title"
                                value={draft.title}
                                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                                placeholder={linkedTask?.title ?? linkedDeadline?.title ?? "Наприклад, підготовка до семінару"}
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="planner-description">Опис</Label>
                            <Textarea
                                id="planner-description"
                                className="min-h-24"
                                value={draft.description}
                                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                                placeholder="Контекст, підетапи або чекпоїнти"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planner-type">Тип</Label>
                            <select
                                id="planner-type"
                                className={selectClassName}
                                value={draft.type}
                                onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as PlannerBlockType }))}
                            >
                                <option value="manual">Manual</option>
                                <option value="focus">Focus</option>
                                <option value="task">Task</option>
                                <option value="deadline">Deadline</option>
                                <option value="break">Break</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planner-status">Статус</Label>
                            <select
                                id="planner-status"
                                className={selectClassName}
                                value={draft.status}
                                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as PlannerBlockStatus }))}
                            >
                                <option value="planned">Planned</option>
                                <option value="in_progress">In progress</option>
                                <option value="completed">Completed</option>
                                <option value="skipped">Skipped</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Дата</Label>
                            <DateInput value={draft.date} onChange={(value) => setDraft((current) => ({ ...current, date: value }))} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Початок</Label>
                                <TimeInput value={draft.startTime} onChange={(value) => setDraft((current) => ({ ...current, startTime: value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Кінець</Label>
                                <TimeInput value={draft.endTime} onChange={(value) => setDraft((current) => ({ ...current, endTime: value }))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planner-task">Task</Label>
                            <select
                                id="planner-task"
                                className={selectClassName}
                                value={draft.taskId ?? ""}
                                onChange={(event) => setDraft((current) => ({
                                    ...current,
                                    taskId: event.target.value ? Number(event.target.value) : null,
                                }))}
                            >
                                <option value="">Без task</option>
                                {tasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planner-deadline">Deadline</Label>
                            <select
                                id="planner-deadline"
                                className={selectClassName}
                                value={draft.deadlineId ?? ""}
                                onChange={(event) => setDraft((current) => ({
                                    ...current,
                                    deadlineId: event.target.value ? Number(event.target.value) : null,
                                }))}
                            >
                                <option value="">Без deadline</option>
                                {deadlines.map((deadline) => (
                                    <option key={deadline.id} value={deadline.id}>
                                        {deadline.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planner-subject">Предмет</Label>
                            <select
                                id="planner-subject"
                                className={selectClassName}
                                value={draft.subjectId ?? ""}
                                onChange={(event) => setDraft((current) => ({
                                    ...current,
                                    subjectId: event.target.value ? Number(event.target.value) : null,
                                }))}
                            >
                                <option value="">Без предмета</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="planner-priority">Priority</Label>
                                <Input
                                    id="planner-priority"
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={draft.priority ?? ""}
                                    onChange={(event) => setDraft((current) => ({
                                        ...current,
                                        priority: event.target.value ? Number(event.target.value) : null,
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="planner-energy">Energy</Label>
                                <select
                                    id="planner-energy"
                                    className={selectClassName}
                                    value={draft.energyLevel ?? ""}
                                    onChange={(event) => setDraft((current) => ({
                                        ...current,
                                        energyLevel: event.target.value ? event.target.value as PlannerEnergyLevel : null,
                                    }))}
                                >
                                    <option value="">Без energy level</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={draft.isLocked}
                            onChange={(event) => setDraft((current) => ({ ...current, isLocked: event.target.checked }))}
                        />
                        Заблокувати блок від автопланування
                    </label>

                    <DialogFooter className="items-center justify-between">
                        <div>
                            {block && onDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => void onDelete(block)}
                                >
                                    <Trash2Icon className="mr-2 size-4" />
                                    Видалити
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Скасувати
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                                {block ? "Зберегти" : "Створити"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
