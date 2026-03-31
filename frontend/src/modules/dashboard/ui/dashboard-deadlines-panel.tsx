import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, CheckCircle2Icon, FlagIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { Deadline } from "@/modules/deadlines/model/types";

const priorityMeta: Record<string, { label: string; dot: string }> = {
    critical: { label: "Критичний", dot: "bg-red-500" },
    high:     { label: "Високий",   dot: "bg-orange-500" },
    medium:   { label: "Середній",  dot: "bg-amber-500" },
    low:      { label: "Низький",   dot: "bg-blue-400" },
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
    const closestCritical =
        deadlines.find((d) => d.priority === "critical" || d.priority === "high") ?? null;

    return (
        <div className="flex flex-col overflow-hidden rounded-[28px] border border-border/50 bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Дедлайни</p>
                    <h2 className="text-sm font-semibold">Найближчі задачі</h2>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 gap-1 rounded-xl text-xs">
                    <Link to="/dashboard/deadlines">
                        Всі дедлайни
                        <ArrowRightIcon className="size-3" />
                    </Link>
                </Button>
            </div>

            <div className="flex-1 p-4 space-y-3">
                {isLoading ? (
                    <div className="space-y-2.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 rounded-2xl" />
                        ))}
                    </div>
                ) : deadlines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2Icon className="size-9 text-emerald-500/40" />
                        <p className="mt-3 text-sm font-medium">Все під контролем</p>
                        <p className="mt-1 text-xs text-muted-foreground">Близьких дедлайнів немає.</p>
                    </div>
                ) : (
                    <>
                        {/* Critical alert */}
                        {closestCritical && (
                            <div className="rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
                                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-500">
                                    <FlagIcon className="size-3" />
                                    {priorityMeta[closestCritical.priority]?.label}
                                </div>
                                <p className="text-sm font-semibold">{closestCritical.title}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {subjectMap.get(closestCritical.subjectId) ?? "Предмет"} ·{" "}
                                    {formatDistanceToNow(new Date(closestCritical.dueAt), { addSuffix: true, locale: uk })}
                                </p>
                            </div>
                        )}

                        {/* List */}
                        <div className="space-y-1">
                            {deadlines.slice(0, 6).map((deadline) => {
                                const overdue =
                                    new Date(deadline.dueAt) < new Date() && deadline.status !== "completed";
                                const meta = priorityMeta[deadline.priority];

                                return (
                                    <div
                                        key={deadline.id}
                                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/30 transition-colors"
                                    >
                                        <span
                                            className={`mt-1.5 size-2 shrink-0 rounded-full ${meta?.dot ?? "bg-muted-foreground"}`}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-sm font-medium truncate ${overdue ? "text-red-500" : ""}`}
                                            >
                                                {deadline.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {subjectMap.get(deadline.subjectId) ?? "Предмет"} ·{" "}
                                                {formatDistanceToNow(new Date(deadline.dueAt), {
                                                    addSuffix: true,
                                                    locale: uk,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
