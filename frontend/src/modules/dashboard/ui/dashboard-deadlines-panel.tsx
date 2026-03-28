import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, CheckCircle2Icon, AlertTriangleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/ui/card";
import { Button } from "@/shared/shadcn/ui/button";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { Deadline } from "@/modules/deadlines/model/types";
import { priorityConfig } from "@/modules/deadlines/ui/deadline-priority-badge";
import { DashboardSectionHeading } from "./dashboard-section-heading";

const dashPriorityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
    critical: "destructive",
    high: "destructive",
    medium: "secondary",
    low: "outline",
};

export function DashboardDeadlinesPanel({
    deadlines,
    subjectMap,
    isLoading,
}: {
    deadlines: Deadline[];
    subjectMap: Map<number, string>;
    isLoading: boolean;
}) {
    const closestCritical = deadlines.find((deadline) => deadline.priority === "critical" || deadline.priority === "high") ?? null;

    return (
        <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
                <DashboardSectionHeading
                    eyebrow="Дедлайни"
                    title="Найближчі задачі"
                    description="Те, що потребує уваги в першу чергу."
                    action={
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                            <Link to="/dashboard/deadlines">
                                Всі дедлайни
                                <ArrowRightIcon className="size-3.5" />
                            </Link>
                        </Button>
                    }
                />
            </CardHeader>
            <CardContent className="space-y-4">
                {closestCritical ? (
                    <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-5">
                        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-red-500">
                            <AlertTriangleIcon className="size-3.5" />
                            Критичний пріоритет
                        </div>
                        <p className="mt-3 text-lg font-semibold text-foreground">{closestCritical.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {subjectMap.get(closestCritical.subjectId) ?? "Предмет"} ·{" "}
                            {formatDistanceToNow(new Date(closestCritical.dueAt), { addSuffix: true, locale: uk })}
                        </p>
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-18 rounded-3xl" />
                        ))}
                    </div>
                ) : deadlines.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 p-6 text-center">
                        <CheckCircle2Icon className="mx-auto size-8 text-emerald-500/40" />
                        <p className="mt-3 text-sm font-medium text-foreground">На зараз усе чисто</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Активних дедлайнів у короткому горизонті немає.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {deadlines.slice(0, 5).map((deadline) => {
                            const isOverdue = new Date(deadline.dueAt) < new Date() && deadline.status !== "completed";

                            return (
                                <div
                                    key={deadline.id}
                                    className="rounded-3xl border border-border/70 bg-background px-4 py-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className={`text-sm font-medium ${isOverdue ? "text-red-500" : "text-foreground"}`}>
                                                {deadline.title}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {subjectMap.get(deadline.subjectId) ?? "Предмет"} ·{" "}
                                                {formatDistanceToNow(new Date(deadline.dueAt), { addSuffix: true, locale: uk })}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={dashPriorityVariant[deadline.priority] ?? "outline"}
                                            className="rounded-full"
                                        >
                                            {priorityConfig[deadline.priority]?.label ?? deadline.priority}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
