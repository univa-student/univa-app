import { useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
    AlertTriangleIcon,
    CalendarCheckIcon,
    CalendarDaysIcon,
    CheckCircle2Icon,
    ClockIcon,
} from "lucide-react";
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
import { DashboardTodayCard } from "./dashboard-today-card";

const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function DashboardOverview() {
    const authUser = useAuthUser();
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const { data: todayDigest, isLoading: isTodayDigestLoading, isFetched: isTodayDigestFetched } =
        useLatestDailyDigest(todayStr);
    const shouldLoadFallback = isTodayDigestFetched && todayDigest == null;
    const { data: latestDigest, isLoading: isLatestDigestLoading } =
        useLatestDailyDigest(undefined, shouldLoadFallback);

    const { data: deadlineStats, isLoading: isStatsLoading } = useDeadlinesStats();
    const { data: todayInstances = [], isLoading: isScheduleLoading } = useSchedule(todayStr, todayStr);
    const { data: upcomingDeadlines = [], isLoading: isDeadlinesLoading } = useDeadlines({
        timeFrame: "upcoming",
        sortBy: "dueAt",
        sortDir: "asc",
    });
    const { data: overdueDeadlines = [], isLoading: isOverdueLoading } = useDeadlines({
        timeFrame: "overdue",
        sortBy: "dueAt",
        sortDir: "asc",
    });
    const { data: subjects = [] } = useSubjects();
    const { data: recentFiles = [], isLoading: isFilesLoading } = useRecentFiles();
    const { data: storageInfo } = useStorageInfo();

    const subjectMap = useMemo(
        () => new Map(subjects.map((s) => [s.id, s.name])),
        [subjects],
    );

    const resolvedDigest = todayDigest ?? latestDigest;
    const isDigestLoading = isTodayDigestLoading || (shouldLoadFallback && isLatestDigestLoading);

    const todayLessons = useMemo(
        () => [...todayInstances].sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? "")),
        [todayInstances],
    );

    const focusDeadlines = [...overdueDeadlines, ...upcomingDeadlines];
    const focusDeadline =
        focusDeadlines.find((d) => d.priority === "critical" || d.priority === "high") ??
        focusDeadlines[0] ??
        null;

    const fallbackFocus = focusDeadline
        ? `Найперше закрий "${focusDeadline.title}".`
        : todayLessons[0]
            ? `Підготуйся до ${todayLessons[0].subject.name} о ${todayLessons[0].startsAt.slice(0, 5)}.`
            : "Критичних подій на сьогодні немає.";

    const statCards = [
        {
            label: "Прострочені",
            value: deadlineStats?.overdue ?? 0,
            icon: AlertTriangleIcon,
            bg: "bg-red-500/10",
            fg: "text-red-500",
        },
        {
            label: "Сьогодні",
            value: deadlineStats?.today ?? 0,
            icon: CalendarCheckIcon,
            bg: "bg-amber-500/10",
            fg: "text-amber-500",
        },
        {
            label: "На тиждень",
            value: deadlineStats?.thisWeek ?? 0,
            icon: CalendarDaysIcon,
            bg: "bg-blue-500/10",
            fg: "text-blue-500",
        },
        {
            label: "Виконано",
            value: deadlineStats?.completed ?? 0,
            icon: CheckCircle2Icon,
            bg: "bg-emerald-500/10",
            fg: "text-emerald-500",
        },
        {
            label: "У роботі",
            value: Math.max((deadlineStats?.all ?? 0) - (deadlineStats?.completed ?? 0), 0),
            icon: ClockIcon,
            bg: "bg-violet-500/10",
            fg: "text-violet-500",
        },
    ];

    return (
        <motion.div className="flex flex-col gap-5" variants={container} initial="hidden" animate="visible">
            {/* Greeting */}
            <motion.div variants={item}>
                <GreetingHeader user={authUser ?? null} />
            </motion.div>

            {/* Digest */}
            <motion.div variants={item}>
                <DashboardDigestHero
                    digest={resolvedDigest}
                    isLoading={isDigestLoading}
                    fallbackFocus={fallbackFocus}
                    fallbackDate={todayStr}
                />
            </motion.div>

            {/* Stat bar */}
            <motion.div variants={item}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {statCards.map(({ label, value, icon: Icon, bg, fg }) => (
                        <div
                            key={label}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3.5 shadow-sm"
                        >
                            <div>
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums leading-none">{value}</p>
                            </div>
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${bg} ${fg}`}>
                                <Icon className="size-4.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Schedule + Deadlines */}
            <motion.div variants={item}>
                <div className="grid gap-4 xl:grid-cols-2">
                    <DashboardTodayCard lessons={todayLessons} isLoading={isScheduleLoading} />
                    <DashboardDeadlinesPanel
                        deadlines={focusDeadlines}
                        subjectMap={subjectMap}
                        isLoading={isDeadlinesLoading || isOverdueLoading}
                    />
                </div>
            </motion.div>

            {/* Progress + Files */}
            <motion.div variants={item}>
                <div className="grid gap-4 xl:grid-cols-2">
                    <DashboardProgressCard
                        stats={deadlineStats}
                        storageInfo={storageInfo}
                        isLoading={isStatsLoading}
                    />
                    <DashboardFilesPanel files={recentFiles} isLoading={isFilesLoading} />
                </div>
            </motion.div>
        </motion.div>
    );
}
