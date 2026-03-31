import { useMemo, useState } from "react";
import { ArrowRightIcon, CalendarClockIcon, CheckCircle2Icon, FileTextIcon, ListTodoIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeadlines } from "@/modules/deadlines/api/hooks";
import { useNotes, useTasks } from "../api";
import { taskStatusMeta } from "../lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { NoteDialog } from "./note-dialog";
import { TaskDialog } from "./task-dialog";

export function OrganizerHub() {
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const { data: tasks = [], isLoading: isTasksLoading } = useTasks({
        sortBy: "due_at",
        sortDir: "asc",
    });
    const { data: notes = [], isLoading: isNotesLoading } = useNotes({
        archived: false,
    });
    const { data: deadlines = [], isLoading: isDeadlinesLoading } = useDeadlines({
        status: "new,in_progress",
        sortBy: "dueAt",
        sortDir: "asc",
    });

    const taskCounts = useMemo(() => ({
        todo: tasks.filter((task) => task.status === "todo").length,
        in_progress: tasks.filter((task) => task.status === "in_progress").length,
        done: tasks.filter((task) => task.status === "done").length,
        cancelled: tasks.filter((task) => task.status === "cancelled").length,
    }), [tasks]);

    const todayTasks = useMemo(() => {
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        return tasks
            .filter((task) => task.status !== "done" && task.status !== "cancelled")
            .filter((task) => !task.dueAt || new Date(task.dueAt).getTime() <= endOfToday.getTime())
            .slice(0, 4);
    }, [tasks]);

    const pinnedNotes = useMemo(() => {
        const pinned = notes.filter((note) => note.isPinned);
        return (pinned.length > 0 ? pinned : notes).slice(0, 3);
    }, [notes]);

    const priorityDeadlines = deadlines.slice(0, 4);

    return (
        <div className="space-y-6">
            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="rounded-[32px] border border-border/70 bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">Organizer Hub</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                                Сьогоднішній робочий контур без зайвого шуму
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Швидко створи задачу або нотатку, звір активні дедлайни і тримай особистий To-do окремо від навчального плану.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                            <Button onClick={() => setIsTaskOpen(true)}>
                                <PlusIcon className="mr-2 size-4" />
                                Quick task
                            </Button>
                            <Button variant="outline" onClick={() => setIsNoteOpen(true)}>
                                <FileTextIcon className="mr-2 size-4" />
                                Quick note
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[32px] border border-border/70 bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CalendarClockIcon className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Сьогодні</h2>
                            <p className="text-sm text-muted-foreground">Особисті задачі, які варто закрити першими.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isTasksLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-16 rounded-2xl" />
                            ))
                        ) : todayTasks.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                                На сьогодні немає тиску по To-do. Можеш додати наступний крок вручну.
                            </div>
                        ) : (
                            todayTasks.map((task) => (
                                <div key={task.id} className="rounded-[24px] border border-border/70 bg-muted/20 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">{taskStatusMeta[task.status].label}</p>
                                        </div>
                                        <Link to="/dashboard/organizer/to-do" className="text-xs font-medium text-primary">
                                            Відкрити
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-4">
                {(["todo", "in_progress", "done", "cancelled"] as const).map((status) => (
                    <Card key={status} className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm">
                        <p className="text-xs text-muted-foreground">{taskStatusMeta[status].label}</p>
                        <p className="mt-2 text-3xl font-black text-foreground">
                            {taskCounts[status]}
                        </p>
                    </Card>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <Card className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Pinned / latest notes</h2>
                            <p className="text-sm text-muted-foreground">Нотатки, до яких зручно повертатися без пошуку.</p>
                        </div>
                        <Link to="/dashboard/organizer/notes" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Усі нотатки
                            <ArrowRightIcon className="size-4" />
                        </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isNotesLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-24 rounded-2xl" />
                            ))
                        ) : pinnedNotes.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                                Нотаток ще немає. Quick note закриє цей блок одразу.
                            </div>
                        ) : (
                            pinnedNotes.map((note) => (
                                <div key={note.id} className="rounded-[24px] border border-border/70 bg-muted/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">{note.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {note.bodyMarkdown}
                                            </p>
                                        </div>
                                        {note.isPinned ? (
                                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <CheckCircle2Icon className="size-4" />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Дедлайни поруч</h2>
                            <p className="text-sm text-muted-foreground">Read-only огляд академічних дедлайнів без змішування сутностей.</p>
                        </div>
                        <Link to="/dashboard/deadlines" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            До дедлайнів
                            <ArrowRightIcon className="size-4" />
                        </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isDeadlinesLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-18 rounded-2xl" />
                            ))
                        ) : priorityDeadlines.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                                Активних дедлайнів зараз немає.
                            </div>
                        ) : (
                            priorityDeadlines.map((deadline) => (
                                <div key={deadline.id} className="rounded-[24px] border border-border/70 bg-muted/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">{deadline.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {deadline.priority} • {deadline.status}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {deadline.dueAt ? new Date(deadline.dueAt).toLocaleDateString("uk-UA") : "Без дати"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <Link to="/dashboard/organizer/to-do">
                    <Card className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ListTodoIcon className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Перейти в To-do</h3>
                                <p className="text-sm text-muted-foreground">Kanban, фільтри і швидкі статус-дії на картці.</p>
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link to="/dashboard/organizer/notes">
                    <Card className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <FileTextIcon className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Відкрити Notes</h3>
                                <p className="text-sm text-muted-foreground">Markdown preview, архів і прив’язка до задач.</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </section>

            <TaskDialog open={isTaskOpen} onOpenChange={setIsTaskOpen} />
            <NoteDialog open={isNoteOpen} onOpenChange={setIsNoteOpen} />
        </div>
    );
}
