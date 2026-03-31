import { useState } from "react";
import { ArrowRightIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useDeleteTask, useUpdateTask } from "../api";
import { getTaskCategoryDefinition } from "../lib/category-registry";
import { formatTaskDate, getNextTaskStatus, isTaskOverdue, taskPriorityMeta, taskStatusMeta } from "../lib/utils";
import type { Task, TaskStatus } from "../model/types";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/shadcn/ui/dropdown-menu";
import { TaskDialog } from "./task-dialog";

interface Props {
    task: Task;
}

const statusOptions: TaskStatus[] = ["todo", "in_progress", "done", "cancelled"];

export function TaskCard({ task }: Props) {
    const { mutate: deleteTask } = useDeleteTask();
    const { mutate: updateTask } = useUpdateTask();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const category = getTaskCategoryDefinition(task.category);
    const priority = taskPriorityMeta[task.priority];
    const nextStatus = getNextTaskStatus(task.status);
    const isOverdue = isTaskOverdue(task);
    const CategoryIcon = category.icon;

    return (
        <>
            <Card className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className={`flex size-11 items-center justify-center rounded-2xl ${category.accentClassName}`}>
                            <CategoryIcon className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
                            <p className="text-xs text-muted-foreground">{category.label}</p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <MoreVerticalIcon className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <PencilIcon className="mr-2 size-4" />
                                Редагувати
                            </DropdownMenuItem>
                            {statusOptions.map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => updateTask({ id: task.id, payload: { status } })}
                                >
                                    {taskStatusMeta[status].label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                onClick={() => {
                                    if (confirm("Видалити цю задачу?")) {
                                        deleteTask(task.id);
                                    }
                                }}
                            >
                                <TrashIcon className="mr-2 size-4" />
                                Видалити
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {task.description && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {task.description}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={priority.className}>
                        {priority.label}
                    </Badge>
                    <Badge variant="outline">
                        {taskStatusMeta[task.status].label}
                    </Badge>
                    <Badge variant={isOverdue ? "destructive" : "outline"}>
                        {formatTaskDate(task.dueAt)}
                    </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <p className="text-xs text-muted-foreground">
                        {isOverdue ? "Потребує уваги сьогодні." : "Оновлюй статус прямо з картки."}
                    </p>

                    {nextStatus ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => updateTask({ id: task.id, payload: { status: nextStatus } })}
                        >
                            <ArrowRightIcon className="size-4" />
                            {taskStatusMeta[nextStatus].label}
                        </Button>
                    ) : null}
                </div>
            </Card>

            <TaskDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                task={task}
            />
        </>
    );
}
