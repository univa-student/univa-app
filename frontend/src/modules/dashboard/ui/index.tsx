import { useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangleIcon, CalendarCheckIcon, CalendarDaysIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import { useLatestDailyDigest } from "@/modules/ai/api/hooks";
import { useAuthUser } from "@/modules/auth/model/useAuthUser.ts";
import { useDeadlines, useDeadlinesStats } from "@/modules/deadlines/api/hooks";
import { useRecentFiles, useStorageInfo } from "@/modules/files/api/hooks";
import { useSchedule, useSubjects } from "@/modules/schedule/api/hooks";
import { GreetingHeader } from "@/modules/dashboard/ui/greeting-header";
import { DashboardDeadlinesPanel } from "./dashboard-deadlines-panel";
import { DashboardDigestHero } from "./dashboard-digest-hero";
import { DashboardFilesPanel } from "./dashboard-files-panel";
import { DashboardProgressCard } from "./dashboard-progress-card";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardTodayCard } from "./dashboard-today-card";

const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function DashboardOverview() {
    const authUser = useAuthUser();
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const {
        data: todayDigest,
        isLoading: isTodayDigestLoading,
        isFetched: isTodayDigestFetched,
    } = useLatestDailyDigest(todayStr);
    const shouldLoadLatestDigestFallback = isTodayDigestFetched && todayDigest == null;
    const {
        data: latestDigest,
        isLoading: isLatestDigestLoading,
    } = useLatestDailyDigest(undefined, shouldLoadLatestDigestFallback);
    const { data: deadlineStats, isLoading: isStatsLoading } = useDeadlinesStats();
    const { data: todayInstances = [], isLoading: isScheduleLoading } = useSchedule(todayStr, todayStr);
    const { data: upcomingDeadlines = [], isLoading: isDeadlinesLoading } = useDeadlines({
        timeFrame: "upcoming",
        sortBy: "dueAt",
        sortDir: "asc",
    });
    const { data: overdueDeadlines = [], isLoading: isOverdueDeadlinesLoading } = useDeadlines({
        timeFrame: "overdue",
        sortBy: "dueAt",
        sortDir: "asc",
    });
    const { data: subjects = [] } = useSubjects();
    const { data: recentFiles = [], isLoading: isFilesLoading } = useRecentFiles();
    const { data: storageInfo } = useStorageInfo();

    const subjectMap = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject.name])), [subjects]);
    const resolvedDigest = todayDigest ?? latestDigest;
    const isDigestLoading = isTodayDigestLoading || (shouldLoadLatestDigestFallback && isLatestDigestLoading);
    const todayLessons = useMemo(
        () => [...todayInstances].sort((left, right) => (left.startsAt ?? "").localeCompare(right.startsAt ?? "")),
        [todayInstances],
    );

    const focusDeadlines = [...overdueDeadlines, ...upcomingDeadlines];
    const focusDeadline = focusDeadlines.find((deadline) => deadline.priority === "critical" || deadline.priority === "high")
        ?? focusDeadlines[0]
        ?? null;

    const fallbackFocus = focusDeadline
        ? `Найперше закрий "${focusDeadline.title}".`
        : todayLessons[0]
            ? `Підготуйся до ${todayLessons[0].subject.name} о ${todayLessons[0].startsAt.slice(0, 5)}.`
            : "Критичних подій на сьогодні не знайдено.";

    const statCards = [
        {
            label: "Прострочені",
            value: deadlineStats?.overdue ?? 0,
            icon: AlertTriangleIcon,
            tone: "text-red-500 bg-red-500/10",
        },
        {
            label: "На сьогодні",
            value: deadlineStats?.today ?? 0,
            icon: CalendarCheckIcon,
            tone: "text-amber-500 bg-amber-500/10",
        },
        {
            label: "На тиждень",
            value: deadlineStats?.thisWeek ?? 0,
            icon: CalendarDaysIcon,
            tone: "text-blue-500 bg-blue-500/10",
        },
        {
            label: "Виконано",
            value: deadlineStats?.completed ?? 0,
            icon: CheckCircle2Icon,
            tone: "text-emerald-500 bg-emerald-500/10",
        },
        {
            label: "У роботі",
            value: Math.max((deadlineStats?.all ?? 0) - (deadlineStats?.completed ?? 0), 0),
            icon: ClockIcon,
            tone: "text-violet-500 bg-violet-500/10",
        },
    ];

    return (
        <motion.div className="flex flex-col gap-6" variants={container} initial="hidden" animate="visible">
            <motion.section variants={item}>
                <GreetingHeader user={authUser ?? null} />
            </motion.section>

            <motion.section variants={item}>
                <DashboardDigestHero
                    digest={resolvedDigest}
                    isLoading={isDigestLoading}
                    fallbackFocus={fallbackFocus}
                    fallbackDate={todayStr}
                />
            </motion.section>

            <motion.section variants={item}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {statCards.map(({ label, value, icon: Icon, tone }) => (
                        <div key={label} className="rounded-[28px] border border-border/70 bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
                                </div>
                                <div className={`flex size-11 items-center justify-center rounded-2xl ${tone}`}>
                                    <Icon className="size-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <motion.section variants={item}>
                    <DashboardTodayCard lessons={todayLessons} isLoading={isScheduleLoading} />
                </motion.section>
                <motion.section variants={item}>
                    <DashboardDeadlinesPanel
                        deadlines={focusDeadlines}
                        subjectMap={subjectMap}
                        isLoading={isDeadlinesLoading || isOverdueDeadlinesLoading}
                    />
                </motion.section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <motion.section variants={item}>
                    <DashboardProgressCard
                        stats={deadlineStats}
                        storageInfo={storageInfo}
                        isLoading={isStatsLoading}
                    />
                </motion.section>
                <motion.section variants={item}>
                    <DashboardFilesPanel files={recentFiles} isLoading={isFilesLoading} />
                </motion.section>
            </div>

            <motion.section variants={item}>
                <DashboardQuickActions />
            </motion.section>
        </motion.div>
    );
}
