import { ClockIcon, CheckCircle2Icon, PlayCircleIcon, XCircleIcon, AlertOctagonIcon } from "lucide-react";
import type { DeadlineStatus } from "@/modules/deadlines/model/types";
import { Badge } from "@/shared/shadcn/ui/badge";
import { isPast } from "date-fns";

interface Props {
    status: DeadlineStatus;
    dueAt: string; // Used to calculate overdue
}

export function DeadlineStatusBadge({ status, dueAt }: Props) {
    const isOverdue = status !== "completed" && status !== "cancelled" && isPast(new Date(dueAt));

    if (isOverdue) {
        return (
            <Badge variant="destructive" className="gap-1 pr-2.5">
                <AlertOctagonIcon className="size-3" />
                <span>Прострочено</span>
            </Badge>
        );
    }

    if (status === "new") {
        return (
            <Badge variant="secondary" className="gap-1 pr-2.5 text-slate-500">
                <ClockIcon className="size-3" />
                <span>Нове</span>
            </Badge>
        );
    }

    if (status === "in_progress") {
        return (
            <Badge variant="outline" className="gap-1 pr-2.5 text-blue-500 border-blue-500/30">
                <PlayCircleIcon className="size-3" />
                <span>В процесі</span>
            </Badge>
        );
    }

    if (status === "completed") {
        return (
            <Badge variant="secondary" className="gap-1 pr-2.5 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">
                <CheckCircle2Icon className="size-3" />
                <span>Виконано</span>
            </Badge>
        );
    }

    if (status === "cancelled") {
        return (
            <Badge variant="secondary" className="gap-1 pr-2.5 text-muted-foreground">
                <XCircleIcon className="size-3" />
                <span>Відмінено</span>
            </Badge>
        );
    }

    return null;
}
