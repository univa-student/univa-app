import { useState } from "react";
import { format } from "date-fns";
import { MoreVerticalIcon, PencilIcon, TrashIcon, CheckIcon } from "lucide-react";
import type { Deadline } from "@/entities/deadline/model/types";
import { useDeleteDeadline, useUpdateDeadline } from "@/entities/deadline/api/hooks";
import { DeadlineTypeIcon } from "@/shared/ui/deadlines/deadline-type-icon";
import { DeadlinePriorityBadge } from "@/shared/ui/deadlines/deadline-priority-badge";
import { DeadlineStatusBadge } from "@/shared/ui/deadlines/deadline-status-badge";
import { EditDeadlineDialog } from "@/features/deadlines/update-deadline/edit-deadline-dialog";

import { Card } from "@/shared/shadcn/ui/card";
import { Button } from "@/shared/shadcn/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/shadcn/ui/dropdown-menu";

interface Props {
    deadline: Deadline;
    subjectName?: string;
    subjects: { id: number; name: string }[];
    viewMode?: "list" | "grid";
}

export function DeadlineCard({ deadline, subjectName, subjects, viewMode = "list" }: Props) {
    const { mutate: deleteDeadline } = useDeleteDeadline();
    const { mutate: updateDeadline } = useUpdateDeadline();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const isCompleted = deadline.status === "completed";
    const iconBg = isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary";

    const actionsMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVerticalIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <PencilIcon className="size-4 mr-2" />
                    Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={() => {
                        if (confirm("Видалити цей дедлайн?")) deleteDeadline(deadline.id);
                    }}
                >
                    <TrashIcon className="size-4 mr-2" />
                    Видалити
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const markDoneBtn = !isCompleted && (
        <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
            onClick={() => updateDeadline({ id: deadline.id, payload: { status: "completed" } })}
        >
            <CheckIcon className="size-4" />
            <span className="hidden sm:inline">Виконано</span>
        </Button>
    );

    // ── GRID view ────────────────────────────────────────────
    if (viewMode === "grid") {
        return (
            <>
                <Card className="flex flex-col p-4 gap-3 transition-all hover:bg-muted/50 h-full">
                    {/* Header row: icon + date + menu */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${iconBg}`}>
                                <DeadlineTypeIcon type={deadline.type} className="size-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{format(new Date(deadline.dueAt), "dd MMM")}</div>
                                <div className="text-xs text-muted-foreground">{format(new Date(deadline.dueAt), "HH:mm")}</div>
                            </div>
                        </div>
                        {actionsMenu}
                    </div>

                    {/* Title + subject */}
                    <div className="flex-1 min-h-0">
                        <h3 className="font-semibold leading-tight line-clamp-2 text-sm" title={deadline.title}>
                            {deadline.title}
                        </h3>
                        {subjectName && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{subjectName}</p>
                        )}
                        {deadline.description && (
                            <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{deadline.description}</p>
                        )}
                    </div>

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <DeadlineStatusBadge status={deadline.status} dueAt={deadline.dueAt} />
                        <DeadlinePriorityBadge priority={deadline.priority} />
                    </div>

                    {/* Bottom action */}
                    {markDoneBtn && (
                        <div className="pt-1 border-t border-border/50">
                            {markDoneBtn}
                        </div>
                    )}
                </Card>

                {isEditOpen && (
                    <EditDeadlineDialog
                        deadline={deadline}
                        open={isEditOpen}
                        onOpenChange={setIsEditOpen}
                        subjects={subjects}
                    />
                )}
            </>
        );
    }

    // ── LIST view ────────────────────────────────────────────
    return (
        <>
            <Card className="group p-4 transition-colors hover:bg-muted/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Left */}
                    <div className="flex items-center gap-3 sm:w-28 sm:flex-col sm:items-start sm:gap-2 shrink-0">
                        <div className={`flex size-12 items-center justify-center rounded-2xl ${iconBg}`}>
                            <DeadlineTypeIcon type={deadline.type} className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="text-sm font-semibold leading-none">
                                {format(new Date(deadline.dueAt), "dd MMM")}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {format(new Date(deadline.dueAt), "HH:mm")}
                            </div>
                        </div>
                    </div>

                    {/* Center */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <h3
                                    className="line-clamp-1 text-sm font-semibold leading-5 sm:text-base"
                                    title={deadline.title}
                                >
                                    {deadline.title}
                                </h3>

                                {subjectName && (
                                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                        {subjectName}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <DeadlineStatusBadge status={deadline.status} dueAt={deadline.dueAt} />
                                <DeadlinePriorityBadge priority={deadline.priority} />
                            </div>
                        </div>

                        {deadline.description && (
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                {deadline.description}
                            </p>
                        )}
                    </div>

                    {/* Right */}
                    <div className="flex items-center justify-end gap-2 sm:w-auto sm:flex-col sm:items-end shrink-0">
                        {markDoneBtn}
                        {actionsMenu}
                    </div>
                </div>
            </Card>

            {isEditOpen && (
                <EditDeadlineDialog
                    deadline={deadline}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    subjects={subjects}
                />
            )}
        </>
    );
}
