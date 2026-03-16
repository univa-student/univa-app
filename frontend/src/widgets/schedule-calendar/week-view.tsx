import { format, isWeekend } from "date-fns";
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { Deadline } from "@/entities/deadline/model/types";
import {PX_PER_MIN, toMin, minToTop, durationToPx, GRID_TOP_PADDING} from "./schedule.utils";
import { NowLine } from "@/shared/ui/schedule/now-line";
import { EventCard } from "@/shared/ui/schedule/event-card";

interface Props {
    weekDays: Date[];
    weekdayLabels: string[];
    byDate: Record<string, LessonInstance[]>;
    deadlinesByDate: Record<string, Deadline[]>;
    now: Date;
    slotStart: number;
    slotEnd: number;
    hours: number[];
    gridHeight: number;
    showNowLine: boolean;
    onDayClick: (d: Date) => void;
    onLessonClick?: (lessonId: number) => void;
}

const TIME_COL_WIDTH = 50;
const MIN_DAY_WIDTH = 140;

export function WeekView({
                             weekDays, weekdayLabels, byDate, deadlinesByDate,
                             now, slotStart, slotEnd, hours, gridHeight, showNowLine,
                             onDayClick, onLessonClick,
                         }: Props) {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const hourBands = hours.slice(0, -1);
    const minGridWidth = TIME_COL_WIDTH + weekDays.length * MIN_DAY_WIDTH;
    const gridTemplateColumns = `${TIME_COL_WIDTH}px repeat(${weekDays.length}, minmax(${MIN_DAY_WIDTH}px, 1fr))`;

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-border/40 scrollbar-hidden">
                <div style={{ minWidth: minGridWidth }}>

                    {/* ── Sticky header ── */}
                    <div
                        className="sticky top-0 z-30 grid border-b border-border/60 bg-background/95 backdrop-blur"
                        style={{ gridTemplateColumns }}
                    >
                        {/* Corner cell */}
                        <div className="border-r border-border/40 px-2 py-4" />

                        {weekDays.map((day, idx) => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const isToday = dateStr === todayStr;
                            const isDayWeekend = isWeekend(day);
                            const lessonsCount = (byDate[dateStr] ?? []).length;
                            const deadlinesCount = (deadlinesByDate[dateStr] ?? []).length;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => onDayClick(day)}
                                    className={[
                                        "group relative border-l border-border/40 px-3 py-3 text-left",
                                        "transition-colors hover:bg-muted/30",
                                        isDayWeekend && !isToday ? "bg-muted/[0.15]" : "",
                                    ].join(" ")}
                                >
                                    {/* Today indicator bar */}
                                    {isToday && (
                                        <div className="absolute inset-x-0 top-0 h-[2px] bg-primary rounded-b" />
                                    )}

                                    <div className="flex items-center gap-2.5">
                                        {/* Day number */}
                                        <span
                                            className={[
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all",
                                                isToday
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-foreground group-hover:bg-muted",
                                            ].join(" ")}
                                        >
                                            {format(day, "d")}
                                        </span>

                                        <div className="flex flex-col min-w-0">
                                            {/* Weekday label */}
                                            <span className={[
                                                "text-[10px] font-semibold uppercase tracking-widest",
                                                isToday ? "text-primary" : "text-muted-foreground/60",
                                            ].join(" ")}>
                                                {weekdayLabels[idx]}
                                            </span>

                                            {/* Indicators row */}
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {lessonsCount > 0 ? (
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">
                                                        {lessonsCount} {lessonsCount === 1 ? "пара" : lessonsCount < 5 ? "пари" : "пар"}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/30">вільно</span>
                                                )}
                                                {deadlinesCount > 0 && (
                                                    <span className="flex items-center gap-0.5 rounded-full bg-red-500/10 px-1.5 py-px text-[9px] font-semibold text-red-500">
                                                        <span className="size-1 rounded-full bg-red-500 inline-block" />
                                                        {deadlinesCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Body grid ── */}
                    <div className="grid " style={{ gridTemplateColumns }}>

                        {/* Time rail */}
                        <div
                            className="sticky left-0 z-20 border-r border-border/40 bg-background"
                            style={{ height: gridHeight }}
                        >
                            {hourBands.map((hour, i) => (
                                <div
                                    key={hour}
                                    className="absolute inset-x-0"
                                    style={{ top: GRID_TOP_PADDING + i * 60 * PX_PER_MIN }}
                                >
                                    <span className="absolute right-2 -top-2 text-[10px] tabular-nums text-muted-foreground/50 font-medium">
                                        {String(hour).padStart(2, "0")}:00
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Day columns */}
                        {weekDays.map((day) => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const items = byDate[dateStr] ?? [];
                            const deadlines = deadlinesByDate[dateStr] ?? [];
                            const isToday = dateStr === todayStr;
                            const isDayWeekend = isWeekend(day);

                            return (
                                <div
                                    key={dateStr}
                                    className={[
                                        "relative border-l border-border/40",
                                        isToday
                                            ? "bg-primary/[0.02]"
                                            : isDayWeekend
                                                ? "bg-muted/[0.08]"
                                                : "bg-background",
                                    ].join(" ")}
                                    style={{ height: gridHeight }}
                                >
                                    {/* Hour lines */}
                                    {hours.map((_, i) => (
                                        <div
                                            key={`line-${dateStr}-${i}`}
                                            className={`absolute left-0 right-0 border-t ${
                                                i % 2 === 0 ? "border-border/40" : "border-border/15"
                                            }`}
                                            style={{ top: GRID_TOP_PADDING + i * 60 * PX_PER_MIN }}
                                        />
                                    ))}

                                    {/* Today left accent */}
                                    {isToday && (
                                        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-primary/40" />
                                    )}

                                    {isToday && showNowLine && (
                                        <NowLine now={now} slotStart={slotStart} slotEnd={slotEnd} />
                                    )}

                                    {/* Empty state */}
                                    {items.length === 0 && deadlines.length === 0 && (
                                        <div className="pointer-events-none absolute inset-x-2 top-8 flex justify-center">
                                            <span className="rounded-full border border-dashed border-border/50 px-3 py-1 text-[10px] text-muted-foreground/40">
                                                Вільний день
                                            </span>
                                        </div>
                                    )}

                                    {/* Event cards */}
                                    {items.map((inst, ii) => {
                                        const sm = toMin(inst.startsAt);
                                        const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;
                                        return (
                                            <EventCard
                                                key={`${inst.source}-${inst.id}-${ii}`}
                                                inst={inst}
                                                compact={durationToPx(sm, em) < 72}
                                                style={{
                                                    top: minToTop(sm, slotStart),
                                                    height: durationToPx(sm, em),
                                                }}
                                                onClick={
                                                    inst.lessonId && onLessonClick
                                                        ? () => onLessonClick(inst.lessonId!)
                                                        : undefined
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}