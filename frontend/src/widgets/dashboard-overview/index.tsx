import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    CalendarDaysIcon,
    ClockIcon,
    FolderOpenIcon,
    AlertCircleIcon,
    ArrowRightIcon,
    TrendingUpIcon,
    BookOpenIcon,
    CheckCircle2Icon,
    AlertTriangleIcon,
    CalendarCheckIcon,
    FileTextIcon,
    FileSpreadsheetIcon,
    FileIcon,
    PresentationIcon,
    HardDriveIcon,
    GraduationCapIcon,
    SparklesIcon,
    TargetIcon,
    BrainCircuitIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/shadcn/ui/card.tsx";
import { Badge } from "@/shared/shadcn/ui/badge.tsx";
import { Button } from "@/shared/shadcn/ui/button.tsx";
import { Separator } from "@/shared/shadcn/ui/separator.tsx";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { useAuthUser } from "@/entities/user/model/useAuthUser.ts";
import { useDeadlinesStats, useDeadlines } from "@/entities/deadline/api/hooks";
import { useSchedule, useSubjects } from "@/entities/schedule/api/hooks";
import { useRecentFiles, useStorageInfo } from "@/entities/file/api/hooks";
import { priorityConfig } from "@/shared/ui/deadlines/deadline-priority-badge";
import { GreetingHeader } from "@/shared/ui/dashboard/greeting-header";
import type { FileItem } from "@/entities/file/model/types";

const dashPriorityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
    critical: "destructive",
    high: "destructive",
    medium: "secondary",
    low: "outline",
};

function fmtTime(t: string | null | undefined) {
    if (!t) return "";
    return t.slice(0, 5);
}

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
}

function fileIcon(mimeType: string | null) {
    if (!mimeType) return FileIcon;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileTextIcon;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheetIcon;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return PresentationIcon;
    return FileIcon;
}

const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" as const } },
};

const statVisuals = {
    overdue: {
        color: "text-red-500",
        bg: "bg-red-500/10",
        ring: "ring-red-500/15",
    },
    today: {
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        ring: "ring-amber-500/15",
    },
    week: {
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        ring: "ring-blue-500/15",
    },
    upcoming: {
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        ring: "ring-orange-500/15",
    },
    completed: {
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        ring: "ring-emerald-500/15",
    },
    total: {
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        ring: "ring-violet-500/15",
    },
};

function SectionHeading({
                            title,
                            description,
                            icon: Icon,
                            action,
                        }: {
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/60">
                    <Icon className="size-4.5 text-foreground/80" />
                </div>
                <div>
                    <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                    {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
                </div>
            </div>
            {action}
        </div>
    );
}

export function DashboardOverview() {
    const authUser = useAuthUser();
    const { data: dlStats, isLoading: isStatsLoading } = useDeadlinesStats();

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { data: todayInstances = [], isLoading: isScheduleLoading } = useSchedule(todayStr, todayStr);

    const { data: upcomingDeadlines = [], isLoading: isDlLoading } = useDeadlines({
        timeFrame: "upcoming",
        sortBy: "dueAt",
        sortDir: "asc",
    });
    const { data: overdueDeadlines = [] } = useDeadlines({
        timeFrame: "overdue",
        sortBy: "dueAt",
        sortDir: "asc",
    });

    const { data: subjects = [] } = useSubjects();
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    const { data: recentFiles = [], isLoading: isFilesLoading } = useRecentFiles();
    const { data: storageInfo } = useStorageInfo();

    const todayLessons = useMemo(
        () => [...todayInstances].sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? "")),
        [todayInstances],
    );

    const currentLesson = useMemo(() => {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return (
            todayLessons.find((l) => {
                const startMin = parseInt(l.startsAt?.slice(0, 2) ?? "0") * 60 + parseInt(l.startsAt?.slice(3, 5) ?? "0");
                const endMin = l.endsAt
                    ? parseInt(l.endsAt.slice(0, 2)) * 60 + parseInt(l.endsAt.slice(3, 5))
                    : startMin + 90;
                return nowMin >= startMin && nowMin <= endMin;
            }) ?? null
        );
    }, [todayLessons]);

    const nextLesson = useMemo(() => {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return (
            todayLessons.find((l) => {
                const startMin = parseInt(l.startsAt?.slice(0, 2) ?? "0") * 60 + parseInt(l.startsAt?.slice(3, 5) ?? "0");
                return startMin > nowMin;
            }) ?? null
        );
    }, [todayLessons]);

    const allVisibleDeadlines = [...overdueDeadlines, ...upcomingDeadlines].slice(0, 6);

    const closestCritical = [...overdueDeadlines, ...upcomingDeadlines].find(
        (dl) => dl.priority === "critical" || dl.priority === "high",
    );

    const stats = [
        {
            key: "overdue",
            label: "Прострочені",
            value: String(dlStats?.overdue ?? 0),
            icon: AlertTriangleIcon,
            pulse: (dlStats?.overdue ?? 0) > 0,
        },
        {
            key: "today",
            label: "На сьогодні",
            value: String(dlStats?.today ?? 0),
            icon: CalendarCheckIcon,
            pulse: false,
        },
        {
            key: "week",
            label: "На тиждень",
            value: String(dlStats?.thisWeek ?? 0),
            icon: CalendarDaysIcon,
            pulse: false,
        },
        {
            key: "upcoming",
            label: "Найближчі",
            value: String(dlStats?.upcoming ?? 0),
            icon: ClockIcon,
            pulse: false,
        },
        {
            key: "completed",
            label: "Виконано",
            value: String(dlStats?.completed ?? 0),
            icon: CheckCircle2Icon,
            pulse: false,
        },
        {
            key: "total",
            label: "Всього",
            value: String(dlStats?.all ?? 0),
            icon: TargetIcon,
            pulse: false,
        },
    ] as const;

    const progressDone = dlStats?.completed ?? 0;
    const progressTotal = dlStats?.all ?? 1;
    const progressPct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

    const storageUsed = storageInfo?.used ?? 0;
    const storageLimit = storageInfo?.limit ?? 1;
    const storagePct = storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100) : 0;

    const dailyDigest = useMemo(() => {
        const items: Array<{
            tone: "danger" | "warning" | "info" | "success";
            title: string;
            text: string;
        }> = [];

        if (closestCritical) {
            items.push({
                tone: "danger",
                title: "Критичний дедлайн",
                text: `Насамперед варто закрити "${closestCritical.title}" — ${formatDistanceToNow(
                    new Date(closestCritical.dueAt),
                    { addSuffix: true, locale: uk }
                )}.`,
            });
        }

        if (currentLesson) {
            items.push({
                tone: "info",
                title: "Зараз триває пара",
                text: `${currentLesson.subject?.name ?? "Предмет"} до ${fmtTime(currentLesson.endsAt)}.`,
            });
        } else if (nextLesson) {
            items.push({
                tone: "info",
                title: "Наступна пара",
                text: `${nextLesson.subject?.name ?? "Предмет"} о ${fmtTime(nextLesson.startsAt)}.`,
            });
        }

        if ((dlStats?.overdue ?? 0) > 0) {
            items.push({
                tone: "warning",
                title: "Є прострочені задачі",
                text: `У тебе ${dlStats?.overdue ?? 0} прострочених дедлайнів — краще розібрати їх сьогодні.`,
            });
        }

        if (storagePct >= 85) {
            items.push({
                tone: "warning",
                title: "Сховище майже заповнене",
                text: `Використано ${storagePct}% сховища. Варто почистити або перенести старі файли.`,
            });
        }

        if (items.length === 0) {
            items.push({
                tone: "success",
                title: "День виглядає спокійно",
                text: "Критичних подій не знайдено. Можна зосередитися на планових задачах.",
            });
        }

        return items.slice(0, 3);
    }, [
        closestCritical,
        currentLesson,
        nextLesson,
        dlStats?.overdue,
        storagePct,
    ]);

    return (
        <motion.div className="flex flex-col gap-6" variants={container} initial="hidden" animate="visible">
            <motion.section variants={item}>
                <GreetingHeader user={authUser ?? null} />
            </motion.section>

            <motion.section variants={item}>
                <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_20%)]" />
                    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,transparent_0,transparent_29px,rgba(148,163,184,0.08)_30px),linear-gradient(to_bottom,transparent_0,transparent_29px,rgba(148,163,184,0.08)_30px)] [background-size:30px_30px]" />

                    <div className="relative grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
                        <div>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground">
                                            <SparklesIcon className="size-3.5" />
                                            AI-дайджест дня
                                        </div>
                                        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight">
                                            Що сьогодні потребує уваги
                                        </CardTitle>
                                        <CardDescription className="mt-1 max-w-2xl text-sm leading-6">
                                            Коротке зведення по розкладу, дедлайнах і прогресу на основі твоїх даних.
                                        </CardDescription>
                                    </div>

                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                                        {format(new Date(), "d MMMM", { locale: uk })}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {dailyDigest.map((item, index) => (
                                    <div
                                        key={`${item.title}-${index}`}
                                        className={`rounded-2xl border p-4 ${
                                            item.tone === "danger"
                                                ? "border-red-500/20 bg-red-500/5"
                                                : item.tone === "warning"
                                                    ? "border-amber-500/20 bg-amber-500/5"
                                                    : item.tone === "success"
                                                        ? "border-emerald-500/20 bg-emerald-500/5"
                                                        : "border-blue-500/20 bg-blue-500/5"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold">{item.title}</p>
                                        <p className="mt-1 text-sm text-muted-foreground leading-6">{item.text}</p>
                                    </div>
                                ))}

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button asChild className="rounded-xl">
                                        <Link to="/dashboard/deadlines">
                                            Відкрити дедлайни
                                            <ArrowRightIcon className="size-4" />
                                        </Link>
                                    </Button>

                                    <Button variant="outline" asChild className="rounded-xl">
                                        <Link to="/dashboard/schedule/calendar">Подивитися розклад</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <BrainCircuitIcon className="size-4" />
                                    Фокус дня
                                </div>
                                <p className="text-sm font-semibold leading-6">
                                    {closestCritical
                                        ? `Найважливіше зараз — ${closestCritical.title}`
                                        : currentLesson
                                            ? `Зараз триває ${currentLesson.subject?.name ?? "пара"}`
                                            : nextLesson
                                                ? `Далі за розкладом ${nextLesson.subject?.name ?? "пара"}`
                                                : "На сьогодні критичних подій не знайдено"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                                <div className="mb-2 text-xs text-muted-foreground">Прогрес дедлайнів</div>
                                <div className="text-2xl font-semibold">{progressPct}%</div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                                <div className="mb-2 text-xs text-muted-foreground">Зайнятість сховища</div>
                                <div className="text-2xl font-semibold">{storagePct}%</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {fmtSize(storageUsed)} із {fmtSize(storageLimit)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            <motion.section variants={item}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {isStatsLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="rounded-2xl border-border/70 shadow-sm">
                                <CardHeader className="flex-row items-center justify-between pb-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="size-9 rounded-xl" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-14" />
                                </CardContent>
                            </Card>
                        ))
                        : stats.map((s) => {
                            const Icon = s.icon;
                            const visuals = statVisuals[s.key];

                            return (
                                <Card
                                    key={s.label}
                                    className={`rounded-2xl border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${visuals.ring} ring-1`}
                                >
                                    <CardHeader className="flex-row items-start justify-between pb-2">
                                        <div>
                                            <CardDescription className="text-[11px] uppercase tracking-wide">{s.label}</CardDescription>
                                            <p className="mt-2 text-3xl font-semibold leading-none">{s.value}</p>
                                        </div>
                                        <div className={`relative flex size-10 items-center justify-center rounded-2xl ${visuals.bg}`}>
                                            <Icon className={`size-4.5 ${visuals.color}`} />
                                            {s.pulse ? <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500 animate-pulse" /> : null}
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                </div>
            </motion.section>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <motion.section variants={item}>
                    <Card className="h-full rounded-[24px] border-border/70 shadow-sm">
                        <CardHeader className="pb-4">
                            <SectionHeading
                                title="Розклад на сьогодні"
                                description="Поточні та найближчі пари з основною інформацією"
                                icon={CalendarDaysIcon}
                                action={
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="rounded-full px-2.5">
                                            {todayLessons.length} {todayLessons.length === 1 ? "пара" : "пар"}
                                        </Badge>
                                        <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-1">
                                            <Link to="/dashboard/schedule/calendar">
                                                Розклад
                                                <ArrowRightIcon className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                }
                            />
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {(currentLesson || nextLesson) && (
                                <div
                                    className={`rounded-2xl border p-4 ${currentLesson ? "border-blue-500/25 bg-blue-500/5 dark:bg-blue-500/10" : "border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10"}`}
                                >
                                    <div className={`mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${currentLesson ? "text-blue-500" : "text-amber-500"}`}>
                                        {currentLesson ? (
                                            <>
                                                <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                Зараз
                                            </>
                                        ) : (
                                            <>
                                                <ClockIcon className="size-3" />
                                                Наступна пара
                                            </>
                                        )}
                                    </div>
                                    {(() => {
                                        const l = currentLesson ?? nextLesson!;
                                        return (
                                            <>
                                                <p className="text-base font-semibold">{l.subject?.name ?? "Предмет"}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {fmtTime(l.startsAt)}–{fmtTime(l.endsAt)}
                                                    {l.location ? ` · ${l.location}` : ""}
                                                    {l.deliveryMode ? ` · ${l.deliveryMode.name}` : ""}
                                                </p>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {isScheduleLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 rounded-2xl border border-transparent p-2">
                                        <Skeleton className="size-10 rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-52" />
                                        </div>
                                    </div>
                                ))
                            ) : todayLessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-10 text-center">
                                    <CalendarDaysIcon className="mb-2 size-9 text-muted-foreground/25" />
                                    <p className="text-sm text-muted-foreground">На сьогодні пар немає 🎉</p>
                                </div>
                            ) : (
                                todayLessons.map((lesson, i) => {
                                    const accent = lesson.subject?.color ?? "#3b82f6";
                                    const isExam = lesson.source === "exam";

                                    return (
                                        <div key={`${lesson.source}-${lesson.id}-${i}`}>
                                            <div className="flex items-start justify-between gap-3 rounded-2xl border border-transparent bg-muted/30 p-3 transition-colors hover:border-border/70 hover:bg-muted/50">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                                                        style={{ backgroundColor: `${accent}16` }}
                                                    >
                                                        {isExam ? (
                                                            <GraduationCapIcon className="size-4.5" style={{ color: accent }} />
                                                        ) : (
                                                            <BookOpenIcon className="size-4.5" style={{ color: accent }} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{lesson.subject?.name ?? "Предмет"}</p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {fmtTime(lesson.startsAt)}–{fmtTime(lesson.endsAt)}
                                                            {lesson.location ? ` · ${lesson.location}` : ""}
                                                        </p>
                                                        {lesson.subject?.teacherName ? (
                                                            <p className="mt-1 text-[11px] text-muted-foreground/80">{lesson.subject.teacherName}</p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    {lesson.lessonType ? (
                                                        <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">
                                                            {lesson.lessonType.name}
                                                        </Badge>
                                                    ) : null}
                                                    {lesson.deliveryMode ? (
                                                        <Badge
                                                            variant={lesson.deliveryMode.code === "online" ? "secondary" : "outline"}
                                                            className="rounded-full px-2 py-0 text-[10px]"
                                                        >
                                                            {lesson.deliveryMode.name}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                            {i < todayLessons.length - 1 ? <Separator className="mt-3" /> : null}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={item}>
                    <Card className="h-full rounded-[24px] border-border/70 shadow-sm">
                        <CardHeader className="pb-4">
                            <SectionHeading
                                title="Найближчі дедлайни"
                                description="Те, що варто закрити або перевірити в першу чергу"
                                icon={AlertCircleIcon}
                                action={
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive" className="rounded-full px-2.5">
                                            {allVisibleDeadlines.length}
                                        </Badge>
                                        <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-1">
                                            <Link to="/dashboard/deadlines">
                                                Всі
                                                <ArrowRightIcon className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                }
                            />
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {closestCritical ? (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">
                                        <AlertTriangleIcon className="size-3" />
                                        Найближчий критичний
                                    </div>
                                    <p className="text-sm font-semibold">{closestCritical.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {subjectMap.get(closestCritical.subjectId) ?? "Предмет"} ·{" "}
                                        {formatDistanceToNow(new Date(closestCritical.dueAt), { addSuffix: true, locale: uk })}
                                    </p>
                                </div>
                            ) : null}

                            {isDlLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-start justify-between gap-3 rounded-2xl border border-transparent p-2">
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-44" />
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                ))
                            ) : allVisibleDeadlines.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-10 text-center">
                                    <CheckCircle2Icon className="mb-2 size-9 text-emerald-500/40" />
                                    <p className="text-sm text-muted-foreground">Всі дедлайни виконано 🎉</p>
                                </div>
                            ) : (
                                allVisibleDeadlines.map((d, i) => {
                                    const isOverdue = new Date(d.dueAt) < new Date() && d.status !== "completed";

                                    return (
                                        <div key={d.id}>
                                            <div className="flex items-start justify-between gap-3 rounded-2xl border border-transparent bg-muted/30 p-3 transition-colors hover:border-border/70 hover:bg-muted/50">
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm font-medium leading-tight ${isOverdue ? "text-red-500" : ""}`}>
                                                        {d.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {subjectMap.get(d.subjectId) ?? "Предмет"} ·{" "}
                                                        {formatDistanceToNow(new Date(d.dueAt), { addSuffix: true, locale: uk })}
                                                    </p>
                                                </div>
                                                <Badge variant={dashPriorityVariant[d.priority] ?? "outline"} className="shrink-0 rounded-full">
                                                    {priorityConfig[d.priority]?.label ?? d.priority}
                                                </Badge>
                                            </div>
                                            {i < allVisibleDeadlines.length - 1 ? <Separator className="mt-3" /> : null}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <motion.section variants={item}>
                    <Card className="h-full rounded-[24px] border-border/70 shadow-sm">
                        <CardHeader className="pb-4">
                            <SectionHeading
                                title="Прогрес і ресурси"
                                description="Виконання задач і стан сховища"
                                icon={TrendingUpIcon}
                            />
                        </CardHeader>
                        <CardContent className="flex flex-col gap-5">
                            {isStatsLoading ? (
                                <div className="flex flex-col gap-3">
                                    <Skeleton className="h-4 w-full rounded-full" />
                                    <div className="grid grid-cols-3 gap-3">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton key={i} className="h-20 rounded-2xl" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-medium">Загальний прогрес</span>
                                            <span className="text-muted-foreground">
                        {progressDone}/{progressTotal}
                      </span>
                                        </div>
                                        <div className="mb-2 text-3xl font-semibold">{progressPct}%</div>
                                        <div className="h-3 overflow-hidden rounded-full bg-secondary">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPct}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-center">
                                            <div className="text-lg font-semibold text-emerald-500">{dlStats?.completed ?? 0}</div>
                                            <div className="mt-1 text-[11px] text-muted-foreground">Виконано</div>
                                        </div>
                                        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-3 text-center">
                                            <div className="text-lg font-semibold text-amber-500">
                                                {(dlStats?.all ?? 0) - (dlStats?.completed ?? 0)}
                                            </div>
                                            <div className="mt-1 text-[11px] text-muted-foreground">Залишилось</div>
                                        </div>
                                        <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-3 text-center">
                                            <div className="text-lg font-semibold text-red-500">{dlStats?.overdue ?? 0}</div>
                                            <div className="mt-1 text-[11px] text-muted-foreground">Прострочені</div>
                                        </div>
                                    </div>

                                    {storageInfo ? (
                                        <div className="rounded-2xl border border-border/70 p-4">
                                            <div className="mb-3 flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10">
                                                    <HardDriveIcon className="size-4.5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Сховище</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {fmtSize(storageUsed)} із {fmtSize(storageLimit)} використано
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                                <motion.div
                                                    className={`h-full rounded-full ${storagePct > 90 ? "bg-red-500" : storagePct > 70 ? "bg-amber-500" : "bg-blue-500"}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${storagePct}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 }}
                                                />
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={item}>
                    <Card className="h-full rounded-[24px] border-border/70 shadow-sm">
                        <CardHeader className="pb-4">
                            <SectionHeading
                                title="Останні файли"
                                description="Швидкий доступ до матеріалів, з якими ти працював недавно"
                                icon={FolderOpenIcon}
                                action={
                                    <Button variant="ghost" size="sm" asChild className="gap-1">
                                        <Link to="/dashboard/files">
                                            Всі файли
                                            <ArrowRightIcon className="size-3.5" />
                                        </Link>
                                    </Button>
                                }
                            />
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {isFilesLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-transparent p-2">
                                        <Skeleton className="size-10 rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                ))
                            ) : recentFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-10 text-center">
                                    <FolderOpenIcon className="mb-2 size-9 text-muted-foreground/25" />
                                    <p className="text-sm text-muted-foreground">Файлів поки немає</p>
                                </div>
                            ) : (
                                (recentFiles as FileItem[]).slice(0, 5).map((file, i) => {
                                    const Icon = fileIcon(file.mimeType);
                                    return (
                                        <div key={file.id}>
                                            <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-muted/30 p-3 transition-colors hover:border-border/70 hover:bg-muted/50">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background">
                                                    <Icon className="size-4.5 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{file.originalName}</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {file.subject?.name ?? "Загальне"} · {fmtSize(file.size)}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: uk })}
                        </span>
                                            </div>
                                            {i < Math.min(recentFiles.length, 5) - 1 ? <Separator className="mt-3" /> : null}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            <motion.section variants={item}>
                <Card className="rounded-[24px] border-border/70 shadow-sm">
                    <CardHeader className="pb-4">
                        <SectionHeading
                            title="Швидкі дії"
                            description="Переходи до ключових розділів системи"
                            icon={TrendingUpIcon}
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 rounded-2xl py-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                                asChild
                            >
                                <Link to="/dashboard/schedule/calendar">
                                    <CalendarDaysIcon className="size-5" />
                                    <span className="text-xs">Розклад</span>
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 rounded-2xl py-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                                asChild
                            >
                                <Link to="/dashboard/deadlines">
                                    <AlertCircleIcon className="size-5" />
                                    <span className="text-xs">Дедлайни</span>
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 rounded-2xl py-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                                asChild
                            >
                                <Link to="/dashboard/files">
                                    <FolderOpenIcon className="size-5" />
                                    <span className="text-xs">Файли</span>
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto flex-col gap-2 rounded-2xl py-5 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                                asChild
                            >
                                <Link to="/dashboard/settings">
                                    <BookOpenIcon className="size-5" />
                                    <span className="text-xs">Налаштування</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>
        </motion.div>
    );
}
