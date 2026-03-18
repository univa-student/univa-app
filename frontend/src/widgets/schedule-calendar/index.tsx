import { useEffect, useMemo, useRef, useState } from "react";
import {
    addDays, addMonths, endOfMonth, endOfWeek,
    format, startOfMonth, startOfWeek, startOfYear,
} from "date-fns";
import { uk } from "date-fns/locale";
import {
    CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon,
    ClockIcon, GraduationCapIcon, PlusIcon, TimerIcon,
} from "lucide-react";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

import { useSchedule, useLesson } from "@/entities/schedule/api/hooks";
import { useDeadlines } from "@/entities/deadline/api/hooks";
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group";
import { SETTING_GROUP } from "@/pages/settings/config/tabs.config";
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { Deadline } from "@/entities/deadline/model/types";
import { AddLessonModal } from "@/pages/schedule/components/AddLessonModal";
import { AddExamModal } from "@/pages/schedule/components/AddExamModal";
import { EditLessonModal } from "@/pages/schedule/components/EditLessonModal";

import {
    type ViewMode,
    type SchedulerConfig,
    WEEKDAYS_SHORT_FULL,
    WEEKDAYS_SHORT_WORKDAYS,
    toMin,
    fmtTime,
    getGridHeight,
    getHours,
    getSchedulerConfig,
} from "./schedule.utils";

import { SemesterView } from "./semester-view";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { SchedulePanel } from "./schedule-panel";
import { ScheduleRightSidebar } from "@/pages/schedule/subjects/components/ScheduleRightSidebar.tsx";

export function ScheduleCalendar() {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [showAddExam, setShowAddExam] = useState(false);
    const [now, setNow] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const { data: editingLesson } = useLesson(editingLessonId);

    const { data: schedulerSettings } = useSettingsGroup(SETTING_GROUP.SCHEDULER);
    const schedulerConfig = useMemo<SchedulerConfig>(
        () => getSchedulerConfig(schedulerSettings),
        [schedulerSettings],
    );
    const isViewInitialized = useRef(false);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (isViewInitialized.current) return;
        setViewMode(schedulerConfig.defaultView);
        isViewInitialized.current = true;
    }, [schedulerConfig.defaultView]);

    const range = useMemo(() => {
        if (viewMode === "week")
            return { start: startOfWeek(anchorDate, { weekStartsOn: 1 }), end: endOfWeek(anchorDate, { weekStartsOn: 1 }) };
        if (viewMode === "month")
            return { start: startOfMonth(anchorDate), end: endOfMonth(anchorDate) };
        if (viewMode === "semester") {
            const s = startOfYear(anchorDate);
            return { start: s, end: addMonths(s, 6) };
        }
        return { start: anchorDate, end: anchorDate };
    }, [anchorDate, viewMode]);

    const { data: instances = [], isLoading: isLoadingSchedule } = useSchedule(
        format(range.start, "yyyy-MM-dd"),
        format(range.end, "yyyy-MM-dd"),
    );

    const { data: deadlines = [], isLoading: isLoadingDeadlines } = useDeadlines({
        dateFrom: format(range.start, "yyyy-MM-dd"),
        dateTo: format(range.end, "yyyy-MM-dd"),
    });

    const isLoading = isLoadingSchedule || isLoadingDeadlines;

    const byDate = useMemo(() => {
        const map: Record<string, LessonInstance[]> = {};
        instances.forEach(inst => {
            if (!map[inst.date]) map[inst.date] = [];
            map[inst.date].push(inst);
        });
        Object.values(map).forEach(arr =>
            arr.sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""))
        );
        return map;
    }, [instances]);

    const deadlinesByDate = useMemo(() => {
        const map: Record<string, Deadline[]> = {};
        deadlines.forEach(dl => {
            if (!dl.dueAt) return;
            const dateStr = format(new Date(dl.dueAt), "yyyy-MM-dd");
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(dl);
        });
        return map;
    }, [deadlines]);

    const weekDays = useMemo(() => {
        if (viewMode !== "week") return [];
        const length = schedulerConfig.showWeekends ? 7 : 5;
        return Array.from({ length }, (_, i) => addDays(range.start, i));
    }, [range, viewMode, schedulerConfig.showWeekends]);

    const weekdayLabels = schedulerConfig.showWeekends ? WEEKDAYS_SHORT_FULL : WEEKDAYS_SHORT_WORKDAYS;
    const slotStart = schedulerConfig.dayStartMin;
    const slotEnd = schedulerConfig.dayEndMin;
    const gridHeight = getGridHeight(slotStart, slotEnd);
    const hours = getHours(slotStart, slotEnd);

    const todayStr = format(new Date(), "yyyy-MM-dd");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const todayInstances = byDate[todayStr] ?? [];
    const activeDayStr = selectedDay ?? format(anchorDate, "yyyy-MM-dd");
    const activeDayInstances = byDate[activeDayStr] ?? [];

    const nowMin = now.getHours() * 60 + now.getMinutes();

    const { nextLesson, minutesUntilNext } = useMemo(() => {
        let next: LessonInstance | null = null;
        for (const inst of todayInstances) {
            if (toMin(inst.startsAt) > nowMin && !next) next = inst;
        }
        return { nextLesson: next, minutesUntilNext: next ? toMin(next.startsAt) - nowMin : 0 };
    }, [todayInstances, nowMin]);

    const reminderKeySet = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (schedulerConfig.lessonReminderMin === null || !nextLesson) return;
        if (minutesUntilNext !== schedulerConfig.lessonReminderMin) return;
        const key = `${todayStr}:${nextLesson.id}:${schedulerConfig.lessonReminderMin}`;
        if (reminderKeySet.current.has(key)) return;
        reminderKeySet.current.add(key);
        const body = `${nextLesson.subject?.name ?? "Предмет"} починається о ${fmtTime(nextLesson.startsAt)}`;
        if (typeof window !== "undefined" && "Notification" in window) {
            if (window.Notification.permission === "granted") {
                new window.Notification("Нагадування про заняття", { body });
            }
        }
    }, [minutesUntilNext, nextLesson, schedulerConfig.lessonReminderMin, todayStr]);

    useEffect(() => {
        if (schedulerConfig.lessonReminderMin == null) return;
        if (typeof window === "undefined" || !("Notification" in window)) return;
        if (window.Notification.permission !== "default") return;
        void window.Notification.requestPermission();
    }, [schedulerConfig.lessonReminderMin]);

    const completedToday = todayInstances.filter(i => {
        const endMin = i.endsAt ? toMin(i.endsAt) : toMin(i.startsAt) + 90;
        return endMin <= nowMin;
    }).length;

    const weekParityLabel = useMemo(() => {
        const weekNumber = Number(format(anchorDate, "I"));
        const isEven = weekNumber % 2 === 0;
        const matches = schedulerConfig.weekParityAnchor === "even" ? isEven : !isEven;
        return matches ? "Парний" : "Непарний";
    }, [anchorDate, schedulerConfig.weekParityAnchor]);

    function prev() {
        setAnchorDate(d => {
            if (viewMode === "week") return addDays(d, -7);
            if (viewMode === "month") return addMonths(d, -1);
            if (viewMode === "semester") return addMonths(d, -6);
            return addDays(d, -1);
        });
    }
    function next() {
        setAnchorDate(d => {
            if (viewMode === "week") return addDays(d, 7);
            if (viewMode === "month") return addMonths(d, 1);
            if (viewMode === "semester") return addMonths(d, 6);
            return addDays(d, 1);
        });
    }
    function goToday() { setAnchorDate(new Date()); setSelectedDay(null); }
    function goDay(date: Date) {
        setAnchorDate(date);
        setSelectedDay(format(date, "yyyy-MM-dd"));
        setViewMode("day");
    }

    const headerLabel = useMemo(() => {
        if (viewMode === "week")
            return `${format(range.start, "d MMM", { locale: uk })} — ${format(range.end, "d MMM yyyy", { locale: uk })}`;
        if (viewMode === "month")
            return format(anchorDate, "LLLL yyyy", { locale: uk });
        if (viewMode === "semester")
            return `${format(range.start, "MMM yyyy", { locale: uk })} — ${format(range.end, "MMM yyyy", { locale: uk })}`;
        return format(anchorDate, "EEEE, d MMMM", { locale: uk });
    }, [range, anchorDate, viewMode]);

    return (
        <div className="flex flex-col h-full min-h-0 gap-0 p-4">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                        <button onClick={prev} className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-r border-border">
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button onClick={goToday} className="h-9 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-r border-border">
                            Сьогодні
                        </button>
                        <button onClick={next} className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight capitalize text-foreground">{headerLabel}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/50 border border-border/70 rounded-xl p-0.5 gap-0.5 shadow-sm">
                        {(["semester", "month", "week", "day"] as ViewMode[]).map(m => {
                            const label = { semester: "Семестр", month: "Місяць", week: "Тиждень", day: "День" }[m];
                            return (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={[
                                        "px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150",
                                        viewMode === m
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                                    ].join(" ")}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setShowAddLesson(true)}
                        className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />Пара
                    </button>
                    <button
                        onClick={() => setShowAddExam(true)}
                        className="h-9 px-3.5 flex items-center gap-1.5 rounded-xl bg-amber-500 text-white text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors"
                    >
                        <GraduationCapIcon className="w-3.5 h-3.5" />Іспит
                    </button>
                </div>
            </div>

            {/* ── Status strip ── */}
            {!isLoading && todayInstances.length > 0 && (
                <div className="flex items-center gap-3 pb-3 flex-wrap">
                    {nextLesson ? (
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
                            <TimerIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">
                                Наступна пара через{" "}
                                <span className="font-bold text-primary">
                                    {minutesUntilNext >= 60
                                        ? `${Math.floor(minutesUntilNext / 60)}г ${minutesUntilNext % 60 > 0 ? `${minutesUntilNext % 60}хв` : ""}`
                                        : `${minutesUntilNext} хв`}
                                </span>
                                {" "}— {nextLesson.subject?.name}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                            Пари на сьогодні завершено
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                        Парність: <span className="font-semibold text-foreground/80">{weekParityLabel}</span>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-muted-foreground">
                            {completedToday} / {todayInstances.length} пар
                        </span>
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-700"
                                style={{ width: `${Math.round((completedToday / todayInstances.length) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {isLoading ? (
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <Skeleton className="h-12 rounded-xl" />
                                <Skeleton className="h-24 rounded-xl" />
                                <Skeleton className="h-16 rounded-xl" />
                                <Skeleton className="h-20 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : viewMode === "semester" ? (
                    <SemesterView
                        instances={instances}
                        rangeStart={range.start}
                        byDate={byDate}
                        onMonthClick={d => { setAnchorDate(d); setViewMode("month"); }}
                    />
                ) : viewMode === "month" ? (
                    <MonthView
                        rangeStart={range.start}
                        rangeEnd={range.end}
                        byDate={byDate}
                        deadlinesByDate={deadlinesByDate}
                        onDayClick={goDay}
                    />
                ) : viewMode === "week" ? (
                    <WeekView
                        weekDays={weekDays}
                        weekdayLabels={weekdayLabels}
                        byDate={byDate}
                        deadlinesByDate={deadlinesByDate}
                        now={now}
                        slotStart={slotStart}
                        slotEnd={slotEnd}
                        hours={hours}
                        gridHeight={gridHeight}
                        showNowLine={true}
                        onDayClick={goDay}
                        onLessonClick={setEditingLessonId}
                    />
                ) : (
                    <DayView
                        dateStr={activeDayStr}
                        instances={activeDayInstances}
                        deadlines={deadlinesByDate[activeDayStr] ?? []}
                        now={now}
                        isToday={activeDayStr === todayStr}
                        slotStart={slotStart}
                        slotEnd={slotEnd}
                        hours={hours}
                        gridHeight={gridHeight}
                        showNowLine={true}
                        onAddLesson={() => setShowAddLesson(true)}
                        onLessonClick={setEditingLessonId}
                    />
                )}
            </div>

            {viewMode === "day" ? (
                <ScheduleRightSidebar
                    now={now}
                    todayStr={todayStr}
                    activeDayStr={activeDayStr}
                    instances={activeDayInstances}
                    deadlines={deadlinesByDate[activeDayStr] ?? []}
                    nextLesson={nextLesson}
                    minutesUntilNext={minutesUntilNext}
                    onLessonClick={setEditingLessonId}
                />
            ) : (
                <SchedulePanel />
            )}

            {showAddLesson && <AddLessonModal onClose={() => setShowAddLesson(false)} />}
            {showAddExam && <AddExamModal onClose={() => setShowAddExam(false)} />}
            {editingLesson && editingLessonId && (
                <EditLessonModal
                    lesson={editingLesson}
                    onClose={() => setEditingLessonId(null)}
                />
            )}
        </div>
    );
}