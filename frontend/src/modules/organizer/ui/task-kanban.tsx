import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTasks } from "../api";
import { taskStatusMeta, taskStatusOrder } from "../lib/utils";
import type { TaskFilters, TaskStatus } from "../model/types";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { TaskFiltersBar } from "./task-filters";

export function TaskKanban() {
    const [filters, setFilters] = useState<TaskFilters>({
        sortBy: "due_at",
        sortDir: "asc",
    });
    const [createStatus, setCreateStatus] = useState<TaskStatus>("todo");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data: tasks = [], isLoading } = useTasks(filters);

    const groupedTasks = useMemo(() => {
        const groups: Record<TaskStatus, typeof tasks> = {
            todo: [],
            in_progress: [],
            done: [],
            cancelled: [],
        };

        tasks.forEach((task) => {
            groups[task.status].push(task);
        });

        return groups;
    }, [tasks]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">To-do</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kanban для особистих задач з швидкою зміною статусу без drag-and-drop.
                    </p>
                </div>

                <Button
                    className="w-full lg:w-auto"
                    onClick={() => {
                        setCreateStatus("todo");
                        setIsCreateOpen(true);
                    }}
                >
                    <PlusIcon className="mr-2 size-4" />
                    Нова задача
                </Button>
            </div>

            <TaskFiltersBar filters={filters} onChange={setFilters} />

            <div className="grid gap-4 xl:grid-cols-4">
                {taskStatusOrder.map((status) => (
                    <section
                        key={status}
                        className="rounded-[28px] border border-border/70 bg-card p-4 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold">{taskStatusMeta[status].label}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {groupedTasks[status].length} задач
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCreateStatus(status);
                                    setIsCreateOpen(true);
                                }}
                            >
                                <PlusIcon className="size-4" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-36 rounded-[24px]" />
                                ))
                            ) : groupedTasks[status].length === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/30 p-5 text-sm text-muted-foreground">
                                    Поки що порожньо. Додай перший елемент у цю колонку.
                                </div>
                            ) : (
                                groupedTasks[status].map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            )}
                        </div>
                    </section>
                ))}
            </div>

            <TaskDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                defaultStatus={createStatus}
            />
        </div>
    );
}
