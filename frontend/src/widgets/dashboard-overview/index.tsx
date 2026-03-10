import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    CalendarDaysIcon, ClockIcon, FolderOpenIcon,
    AlertCircleIcon, ArrowRightIcon, TrendingUpIcon,
    BookOpenIcon, CheckCircle2Icon, AlertTriangleIcon,
    CalendarCheckIcon, MapPinIcon, FileTextIcon,
    FileSpreadsheetIcon, FileIcon, PresentationIcon,
    HardDriveIcon, GraduationCapIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
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
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { FileItem } from "@/entities/file/model/types";

// ── Helpers ──────────────────────────────────────────────────

const dashPriorityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
    critical: "destructive", high: "destructive", medium: "secondary", low: "outline",
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

// ── Animations ───────────────────────────────────────────────

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

// ── Widget ───────────────────────────────────────────────────

export function DashboardOverview() {
    const authUser = useAuthUser();
    const { data: dlStats, isLoading: isStatsLoading } = useDeadlinesStats();

    // Today's schedule
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { data: todayInstances = [], isLoading: isScheduleLoading } = useSchedule(todayStr, todayStr);

    // Upcoming & overdue deadlines
    const { data: upcomingDeadlines = [], isLoading: isDlLoading } = useDeadlines(
        { timeFrame: "upcoming", sortBy: "dueAt", sortDir: "asc" }
    );
    const { data: overdueDeadlines = [] } = useDeadlines(
        { timeFrame: "overdue", sortBy: "dueAt", sortDir: "asc" }
    );

    // Subjects map
    const { data: subjects = [] } = useSubjects();
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    // Recent files
    const { data: recentFiles = [], isLoading: isFilesLoading } = useRecentFiles();
    const { data: storageInfo } = useStorageInfo();

    // Sort today's lessons by start time
    const todayLessons = useMemo(() =>
        [...todayInstances].sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? "")),
        [todayInstances]);

    // Current/next lesson detection
    const currentLesson = useMemo(() => {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return todayLessons.find(l => {
            const startMin = parseInt(l.startsAt?.slice(0, 2) ?? "0") * 60 + parseInt(l.startsAt?.slice(3, 5) ?? "0");
            const endMin = l.endsAt
                ? parseInt(l.endsAt.slice(0, 2)) * 60 + parseInt(l.endsAt.slice(3, 5))
                : startMin + 90;
            return nowMin >= startMin && nowMin <= endMin;
        }) ?? null;
    }, [todayLessons]);

    const nextLesson = useMemo(() => {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return todayLessons.find(l => {
            const startMin = parseInt(l.startsAt?.slice(0, 2) ?? "0") * 60 + parseInt(l.startsAt?.slice(3, 5) ?? "0");
            return startMin > nowMin;
        }) ?? null;
    }, [todayLessons]);

    // Combine overdue + upcoming for the card — limited to 6
    const allVisibleDeadlines = [...overdueDeadlines, ...upcomingDeadlines].slice(0, 6);

    // Find the closest critical/high priority deadline
    const closestCritical = [...overdueDeadlines, ...upcomingDeadlines].find(
        dl => dl.priority === "critical" || dl.priority === "high"
    );

    // Stats cards
    const stats = [
        { label: "Прострочені", value: String(dlStats?.overdue ?? 0), icon: AlertTriangleIcon, color: "text-red-500", bg: "bg-red-500/10", pulse: (dlStats?.overdue ?? 0) > 0 },
        { label: "На сьогодні", value: String(dlStats?.today ?? 0), icon: CalendarCheckIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "На тиждень", value: String(dlStats?.thisWeek ?? 0), icon: CalendarDaysIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Найближчі", value: String(dlStats?.upcoming ?? 0), icon: ClockIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Виконано", value: String(dlStats?.completed ?? 0), icon: CheckCircle2Icon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Всього", value: String(dlStats?.all ?? 0), icon: AlertCircleIcon, color: "text-violet-500", bg: "bg-violet-500/10" },
    ];

    // Deadline-derived weekly progress
    const progressDone = dlStats?.completed ?? 0;
    const progressTotal = dlStats?.all ?? 1;
    const progressPct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

    // Storage info
    const storageUsed = storageInfo?.used ?? 0;
    const storageLimit = storageInfo?.limit ?? 1;
    const storagePct = storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100) : 0;

    return (
        <motion.div className="flex flex-col gap-6" variants={container} initial="hidden" animate="visible">

            {/* ─── Greeting ─── */}
            <motion.section variants={item}>
                <GreetingHeader user={authUser ?? null} />
            </motion.section>

            {/* ─── Stats grid ─── */}
            <motion.section variants={item}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {isStatsLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} size="sm">
                                <CardHeader className="flex-row items-center justify-between pb-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="size-8 rounded-lg" />
                                </CardHeader>
                                <CardContent><Skeleton className="h-8 w-12" /></CardContent>
                            </Card>
                        ))
                    ) : (
                        stats.map((s) => (
                            <Card key={s.label} size="sm" className="transition-shadow hover:shadow-md">
                                <CardHeader className="flex-row items-center justify-between pb-1">
                                    <CardDescription className="text-xs">{s.label}</CardDescription>
                                    <div className={`relative flex size-8 items-center justify-center rounded-lg ${s.bg}`}>
                                        <s.icon className={`size-4 ${s.color}`} />
                                        {s.pulse && (
                                            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500 animate-pulse" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </motion.section>

            {/* ─── Schedule + Deadlines ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.section variants={item}>
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><CalendarDaysIcon className="size-5 text-blue-500" /><CardTitle>Розклад на сьогодні</CardTitle></div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{todayLessons.length} {todayLessons.length === 1 ? "пара" : "пар"}</Badge>
                                    <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-xs gap-1">
                                        <Link to="/dashboard/schedule/calendar">Розклад <ArrowRightIcon className="size-3" /></Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 flex-1">
                            {/* Current/next lesson highlight */}
                            {(currentLesson || nextLesson) && (
                                <div className={`rounded-xl border p-3 mb-1 ${currentLesson
                                    ? "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10"
                                    : "border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10"
                                    }`}>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1 ${currentLesson ? "text-blue-500" : "text-amber-500"}`}>
                                        {currentLesson ? (
                                            <><span className="size-1.5 rounded-full bg-blue-500 animate-pulse" /> Зараз</>
                                        ) : (
                                            <><ClockIcon className="size-3" /> Наступна</>
                                        )}
                                    </div>
                                    {(() => {
                                        const l = currentLesson ?? nextLesson!;
                                        return (
                                            <>
                                                <p className="text-sm font-bold">{l.subject?.name ?? "Предмет"}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {fmtTime(l.startsAt)}–{fmtTime(l.endsAt)} · {l.location ?? ""} {l.deliveryMode ? `· ${l.deliveryMode.name}` : ""}
                                                </p>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {isScheduleLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Skeleton className="size-9 rounded-lg shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                ))
                            ) : todayLessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CalendarDaysIcon className="size-8 text-muted-foreground/20 mb-2" />
                                    <p className="text-sm text-muted-foreground">На сьогодні пар немає 🎉</p>
                                </div>
                            ) : (
                                todayLessons.map((lesson, i) => {
                                    const accent = lesson.subject?.color ?? "#3b82f6";
                                    const isExam = lesson.source === "exam";
                                    return (
                                        <div key={`${lesson.source}-${lesson.id}-${i}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                                        style={{ backgroundColor: `${accent}18` }}
                                                    >
                                                        {isExam ? (
                                                            <GraduationCapIcon className="size-4" style={{ color: accent }} />
                                                        ) : (
                                                            <BookOpenIcon className="size-4" style={{ color: accent }} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-tight">{lesson.subject?.name ?? "Предмет"}</p>
                                                        <p className="text-muted-foreground text-xs mt-0.5">
                                                            {fmtTime(lesson.startsAt)}–{fmtTime(lesson.endsAt)}
                                                            {lesson.location && ` · ${lesson.location}`}
                                                        </p>
                                                        {lesson.subject?.teacherName && (
                                                            <p className="text-muted-foreground/70 text-[11px] mt-0.5 flex items-center gap-1">
                                                                {lesson.subject.teacherName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {lesson.lessonType && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{lesson.lessonType.name}</Badge>
                                                    )}
                                                    {lesson.deliveryMode && (
                                                        <Badge variant={lesson.deliveryMode.code === "online" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                                                            {lesson.deliveryMode.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {i < todayLessons.length - 1 && <Separator className="mt-3" />}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={item}>
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><AlertCircleIcon className="size-5 text-red-500" /><CardTitle>Найближчі дедлайни</CardTitle></div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="destructive">{allVisibleDeadlines.length}</Badge>
                                    <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-xs gap-1">
                                        <Link to="/dashboard/deadlines">Всі <ArrowRightIcon className="size-3" /></Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 flex-1">
                            {/* Closest critical deadline highlight */}
                            {closestCritical && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 mb-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
                                        <AlertTriangleIcon className="size-3" />
                                        Найближчий критичний
                                    </div>
                                    <p className="text-sm font-bold">{closestCritical.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {subjectMap.get(closestCritical.subjectId) ?? "Предмет"} · {formatDistanceToNow(new Date(closestCritical.dueAt), { addSuffix: true, locale: uk })}
                                    </p>
                                </div>
                            )}

                            {isDlLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-start justify-between gap-2">
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                ))
                            ) : allVisibleDeadlines.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle2Icon className="size-8 text-emerald-500/50 mb-2" />
                                    <p className="text-sm text-muted-foreground">Всі дедлайни виконано 🎉</p>
                                </div>
                            ) : (
                                allVisibleDeadlines.map((d, i) => {
                                    const isOverdue = new Date(d.dueAt) < new Date() && d.status !== "completed";
                                    return (
                                        <div key={d.id}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium leading-tight ${isOverdue ? "text-red-500" : ""}`}>{d.title}</p>
                                                    <p className="text-muted-foreground text-xs mt-0.5">
                                                        {subjectMap.get(d.subjectId) ?? "Предмет"} · {formatDistanceToNow(new Date(d.dueAt), { addSuffix: true, locale: uk })}
                                                    </p>
                                                </div>
                                                <Badge variant={dashPriorityVariant[d.priority] ?? "outline"} className="shrink-0">
                                                    {priorityConfig[d.priority]?.label ?? d.priority}
                                                </Badge>
                                            </div>
                                            {i < allVisibleDeadlines.length - 1 && <Separator className="mt-3" />}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            {/* ─── Progress + Recent files ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.section variants={item}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2"><TrendingUpIcon className="size-5 text-emerald-500" /><CardTitle>Прогрес дедлайнів</CardTitle></div>
                            <CardDescription>{progressDone} із {progressTotal} дедлайнів виконано</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {isStatsLoading ? (
                                <div className="flex flex-col gap-3">
                                    <Skeleton className="h-4 w-full rounded-full" />
                                    <div className="grid grid-cols-3 gap-3">
                                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{progressPct}%</span>
                                            <span className="text-muted-foreground text-xs">{progressDone}/{progressTotal}</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-secondary overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPct}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-500/5">
                                            <span className="text-lg font-bold text-emerald-500">{dlStats?.completed ?? 0}</span>
                                            <span className="text-[10px] text-muted-foreground">Виконано</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-amber-500/5">
                                            <span className="text-lg font-bold text-amber-500">{(dlStats?.all ?? 0) - (dlStats?.completed ?? 0)}</span>
                                            <span className="text-[10px] text-muted-foreground">Залишилось</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-500/5">
                                            <span className="text-lg font-bold text-red-500">{dlStats?.overdue ?? 0}</span>
                                            <span className="text-[10px] text-muted-foreground">Прострочені</span>
                                        </div>
                                    </div>

                                    {/* Storage info */}
                                    {storageInfo && (
                                        <>
                                            <Separator />
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                                                    <HardDriveIcon className="size-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="font-medium">Сховище</span>
                                                        <span className="text-muted-foreground">{fmtSize(storageUsed)} / {fmtSize(storageLimit)}</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${storagePct > 90 ? "bg-red-500" : storagePct > 70 ? "bg-amber-500" : "bg-blue-500"}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${storagePct}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.section variants={item}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><FolderOpenIcon className="size-5 text-emerald-500" /><CardTitle>Останні файли</CardTitle></div>
                                <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                                    <Link to="/dashboard/files">Всі файли <ArrowRightIcon className="size-3" /></Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {isFilesLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="size-9 rounded-lg shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                ))
                            ) : recentFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FolderOpenIcon className="size-8 text-muted-foreground/20 mb-2" />
                                    <p className="text-sm text-muted-foreground">Файлів поки немає</p>
                                </div>
                            ) : (
                                (recentFiles as FileItem[]).slice(0, 5).map((file, i) => {
                                    const Icon = fileIcon(file.mimeType);
                                    return (
                                        <div key={file.id}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    <Icon className="size-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.originalName}</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        {file.subject?.name ?? "Загальне"} · {fmtSize(file.size)}
                                                    </p>
                                                </div>
                                                <span className="text-muted-foreground text-xs shrink-0">
                                                    {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: uk })}
                                                </span>
                                            </div>
                                            {i < Math.min(recentFiles.length, 5) - 1 && <Separator className="mt-3" />}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            {/* ─── Quick actions ─── */}
            <motion.section variants={item}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2"><TrendingUpIcon className="size-5 text-primary" /><CardTitle>Швидкі дії</CardTitle></div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/30 hover:bg-primary/5 transition-colors" asChild>
                                <Link to="/dashboard/schedule/calendar"><CalendarDaysIcon className="size-5" /><span className="text-xs">Розклад</span></Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/30 hover:bg-primary/5 transition-colors" asChild>
                                <Link to="/dashboard/deadlines"><AlertCircleIcon className="size-5" /><span className="text-xs">Дедлайни</span></Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/30 hover:bg-primary/5 transition-colors" asChild>
                                <Link to="/dashboard/files"><FolderOpenIcon className="size-5" /><span className="text-xs">Файли</span></Link>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4 hover:border-primary/30 hover:bg-primary/5 transition-colors" asChild>
                                <Link to="/dashboard/settings"><BookOpenIcon className="size-5" /><span className="text-xs">Налаштування</span></Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>
        </motion.div>
    );
}
