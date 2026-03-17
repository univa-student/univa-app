/**
 * SchedulePanel — side panel for the /schedule page.
 * Shows today's lessons list + upcoming deadlines.
 */
import { useMemo } from "react"
import { format, isSameDay, parseISO, isAfter } from "date-fns"
import { uk } from "date-fns/locale"
import {
    BookOpenIcon,
    GraduationCapIcon,
    ClockIcon,
    MapPinIcon,
    AlertCircleIcon,
    CheckCircle2Icon,
    CalendarDaysIcon,
} from "lucide-react"
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Separator } from "@/shared/shadcn/ui/separator"
import { useSchedule } from "@/entities/schedule/api/hooks"
import { useDeadlines } from "@/entities/deadline/api/hooks"
import type { LessonInstance } from "@/entities/schedule/model/types"
import type { Deadline, DeadlinePriority } from "@/entities/deadline/model/types"
import { PageSidePanel } from "@/shared/ui/page-side-panel"

const PRIORITY_COLOR: Record<DeadlinePriority, string> = {
    low: "bg-muted-foreground/30",
    medium: "bg-amber-500",
    high: "bg-orange-500",
    critical: "bg-destructive",
}

function PriorityDot({ priority }: { priority: DeadlinePriority }) {
    return <span className={`inline-block size-2 rounded-full flex-shrink-0 ${PRIORITY_COLOR[priority]}`} />
}

function LessonCard({ lesson }: { lesson: LessonInstance }) {
    const isExam = lesson.source === "exam"
    const time = lesson.startsAt.slice(0, 5)
    const Icon = isExam ? GraduationCapIcon : BookOpenIcon
    const subjectColor = lesson.subject.color ?? undefined

    return (
        <div className="flex gap-2.5 py-2.5 px-3 rounded-lg hover:bg-accent/40 transition-colors group">
            <div
                className="flex-shrink-0 size-7 rounded-md flex items-center justify-center mt-0.5"
                style={subjectColor
                    ? { background: `color-mix(in srgb, ${subjectColor} 20%, transparent)`, color: subjectColor }
                    : { background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }
                }
            >
                <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-foreground truncate leading-tight">
                    {lesson.subject.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <ClockIcon className="size-3" />{time}
                    </span>
                    {lesson.lessonType && (
                        <span className="text-[11px] text-muted-foreground/70">{lesson.lessonType.name}</span>
                    )}
                    {lesson.location && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                            <MapPinIcon className="size-3" />{lesson.location}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

function DeadlineRow({ deadline }: { deadline: Deadline }) {
    const isOverdue = isAfter(new Date(), parseISO(deadline.dueAt)) && deadline.status !== "completed"
    const isDone = deadline.status === "completed"

    return (
        <div className={`flex items-start gap-2 py-2 px-3 rounded-lg transition-colors ${isDone ? "opacity-50" : "hover:bg-accent/40"}`}>
            <PriorityDot priority={deadline.priority} />
            <div className="min-w-0 flex-1 mt-[-1px]">
                <p className={`text-[12px] font-medium leading-snug truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {deadline.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                    {isOverdue && !isDone && <AlertCircleIcon className="size-3 text-destructive" />}
                    {isDone && <CheckCircle2Icon className="size-3 text-primary" />}
                    <span className={`text-[11px] ${isOverdue && !isDone ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        {format(parseISO(deadline.dueAt), "dd MMM", { locale: uk })}
                    </span>
                </div>
            </div>
        </div>
    )
}

export function SchedulePanel() {
    const today = new Date()
    const from = format(today, "yyyy-MM-dd")
    const to = format(today, "yyyy-MM-dd")

    const { data: schedule, isLoading: scheduleLoading } = useSchedule(from, to)
    const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines({ status: "new,in_progress" })

    const todayLessons = useMemo<LessonInstance[]>(() => {
        if (!schedule) return []
        return schedule
            .filter((l: LessonInstance) => isSameDay(parseISO(l.date), today))
            .sort((a: LessonInstance, b: LessonInstance) => a.startsAt.localeCompare(b.startsAt))
    }, [schedule])

    const upcoming = useMemo<Deadline[]>(() => {
        if (!deadlines) return []
        return [...deadlines]
            .sort((a: Deadline, b: Deadline) => a.dueAt.localeCompare(b.dueAt))
            .slice(0, 8)
    }, [deadlines])

    const dateLabel = format(today, "EEEE, d MMMM", { locale: uk })

    return (
        <PageSidePanel>
            <ScrollArea className="h-full">
                {/* Today's lessons */}
                <div className="p-3 pb-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <CalendarDaysIcon className="size-3.5 text-muted-foreground/70" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Сьогодні
                        </span>
                        <span className="text-[11px] text-muted-foreground/50 ml-auto capitalize">{dateLabel}</span>
                    </div>

                    {scheduleLoading && (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                        </div>
                    )}

                    {!scheduleLoading && todayLessons.length === 0 && (
                        <p className="text-[12px] text-muted-foreground/50 py-4 text-center">
                            Пар немає 🎉
                        </p>
                    )}

                    {todayLessons.map(lesson => (
                        <LessonCard key={lesson.id} lesson={lesson} />
                    ))}
                </div>

                <Separator className="mx-3 w-auto" />

                {/* Upcoming deadlines */}
                <div className="p-3 pt-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <AlertCircleIcon className="size-3.5 text-muted-foreground/70" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Дедлайни
                        </span>
                        {upcoming.length > 0 && (
                            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">
                                {upcoming.length}
                            </Badge>
                        )}
                    </div>

                    {deadlinesLoading && (
                        <div className="space-y-1.5">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-9 rounded-lg" />)}
                        </div>
                    )}

                    {!deadlinesLoading && upcoming.length === 0 && (
                        <p className="text-[12px] text-muted-foreground/50 py-4 text-center">
                            Дедлайнів немає ✅
                        </p>
                    )}

                    {upcoming.map(d => <DeadlineRow key={d.id} deadline={d} />)}
                </div>
            </ScrollArea>
        </PageSidePanel>
    )
}
