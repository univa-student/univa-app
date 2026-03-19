/**
 * DeadlinesPanel — side panel for the /deadlines page.
 * Shows stats (total / done / overdue) + filtered quick list.
 */
import { useMemo } from "react"
import { format, isAfter, parseISO } from "date-fns"
import { uk } from "date-fns/locale"
import {
    CheckCircle2Icon,
    AlertCircleIcon,
    ClockIcon,
    ListTodoIcon,
    ZapIcon,
} from "lucide-react"
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"
import { Badge } from "@/shared/shadcn/ui/badge"
import { useDeadlines, useDeadlinesStats } from "@/modules/deadlines/api/hooks"
import type { Deadline, DeadlinePriority } from "@/modules/deadlines/model/types"
import { PageSidePanel } from "@/shared/ui/page-side-panel"

const PRIORITY_LABEL: Record<DeadlinePriority, string> = {
    low: "Низький",
    medium: "Середній",
    high: "Високий",
    critical: "Критичний",
}

const PRIORITY_BG: Record<DeadlinePriority, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    high: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    critical: "bg-destructive/15 text-destructive",
}

function StatCard({ label, value, icon: Icon, color }: {
    label: string; value: number; icon: typeof ZapIcon; color: string
}) {
    return (
        <div className={`flex flex-col p-2.5 rounded-lg ${color}`}>
            <Icon className="size-3.5 mb-1 opacity-70" />
            <span className="text-lg font-bold leading-none">{value}</span>
            <span className="text-[10px] mt-0.5 opacity-70 leading-tight">{label}</span>
        </div>
    )
}

export function DeadlinesPanel() {
    const { data: deadlines, isLoading } = useDeadlines()
    const { data: stats } = useDeadlinesStats()

    const today = new Date()

    const urgent = useMemo<Deadline[]>(() => {
        if (!deadlines) return []
        return deadlines
            .filter((d: Deadline) => d.status !== "completed" && d.status !== "cancelled")
            .sort((a: Deadline, b: Deadline) => a.dueAt.localeCompare(b.dueAt))
            .slice(0, 10)
    }, [deadlines])

    const overdue = urgent.filter(d => isAfter(today, parseISO(d.dueAt)))

    return (
        <PageSidePanel>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Stats */}
                <div className="p-3 space-y-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ListTodoIcon className="size-3.5 text-muted-foreground/70" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Статистика
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <StatCard
                            label="Активних"
                            value={stats?.active ?? 0}
                            icon={ZapIcon}
                            color="bg-primary/8 text-primary"
                        />
                        <StatCard
                            label="Виконано"
                            value={stats?.completed ?? 0}
                            icon={CheckCircle2Icon}
                            color="bg-green-500/10 text-green-600 dark:text-green-400"
                        />
                        <StatCard
                            label="Прострочено"
                            value={overdue.length}
                            icon={AlertCircleIcon}
                            color={overdue.length > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
                        />
                        <StatCard
                            label="Всього"
                            value={stats?.total ?? 0}
                            icon={ClockIcon}
                            color="bg-muted text-muted-foreground"
                        />
                    </div>
                </div>

                <div className="mx-3 h-[1px] bg-border flex-shrink-0" />

                {/* Upcoming list */}
                <div className="flex flex-col flex-1 min-h-0 p-3 pt-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <ClockIcon className="size-3.5 text-muted-foreground/70" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Найближчі
                        </span>
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
                            {urgent.length}
                        </Badge>
                    </div>

                    <ScrollArea className="flex-1">
                        {isLoading && (
                            <div className="space-y-1.5">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                            </div>
                        )}

                        {!isLoading && urgent.length === 0 && (
                            <p className="text-[12px] text-muted-foreground/50 py-6 text-center">
                                Дедлайнів немає ✅
                            </p>
                        )}

                        <div className="space-y-1">
                            {urgent.map(d => {
                                const isOverdue = isAfter(today, parseISO(d.dueAt))
                                return (
                                    <div
                                        key={d.id}
                                        className={`p-2.5 rounded-lg space-y-1 ${isOverdue ? "bg-destructive/5 border border-destructive/20" : "hover:bg-accent/40"} transition-colors`}
                                    >
                                        <p className="text-[12px] font-medium text-foreground leading-snug truncate">
                                            {d.title}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_BG[d.priority]}`}>
                                                {PRIORITY_LABEL[d.priority]}
                                            </span>
                                            <span className={`text-[11px] ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                                {isOverdue && "⚠ "}
                                                {format(parseISO(d.dueAt), "dd MMM", { locale: uk })}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </PageSidePanel>
    )
}
