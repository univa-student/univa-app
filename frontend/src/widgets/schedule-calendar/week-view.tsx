import { format, isWeekend } from "date-fns";
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { Deadline } from "@/entities/deadline/model/types";
import { PX_PER_MIN, toMin, minToTop, durationToPx } from "./schedule.utils";
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

const TIME_COL_WIDTH = 72;
const MIN_DAY_WIDTH = 170;

export function WeekView({
                             weekDays,
                             weekdayLabels,
                             byDate,
                             deadlinesByDate,
                             now,
                             slotStart,
                             slotEnd,
                             hours,
                             gridHeight,
                             showNowLine,
                             onDayClick,
                             onLessonClick,
                         }: Props) {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const hourBands = hours.slice(0, -1);
    const minGridWidth = TIME_COL_WIDTH + weekDays.length * MIN_DAY_WIDTH;
    const gridTemplateColumns = `${TIME_COL_WIDTH}px repeat(${weekDays.length}, minmax(${MIN_DAY_WIDTH}px, 1fr))`;

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border/70 bg-card shadow-sm">
            <div className="flex-1 overflow-auto">
                <div style={{ minWidth: minGridWidth }}>
                    {/* Sticky header */}
                    <div
                        className="sticky top-0 z-30 grid border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
                        style={{ gridTemplateColumns }}
                    >
                        <div className="flex items-center justify-center border-r border-border/60 bg-muted/20 px-2 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                            Час
                        </div>

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
                                        "group relative border-l border-border/60 px-2 py-3 transition-colors",
                                        "hover:bg-muted/40",
                                        isToday ? "bg-primary/[0.06]" : "",
                                        isDayWeekend && !isToday ? "bg-muted/[0.18]" : "",
                                    ].join(" ")}
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                                            {weekdayLabels[idx]}
                                        </span>

                                        <div className="relative">
                                            <span
                                                className={[
                                                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                                                    isToday
                                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                                        : "text-foreground group-hover:bg-muted",
                                                ].join(" ")}
                                            >
                                                {format(day, "d")}
                                            </span>

                                            {deadlinesCount > 0 && (
                                                <span
                                                    className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-background"
                                                    title={`${deadlinesCount} дедлайнів`}
                                                >
                                                    {deadlinesCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex min-h-4 items-center gap-1">
                                            {lessonsCount > 0 ? (
                                                <span className="text-[10px] tabular-nums text-muted-foreground">
                                                    {lessonsCount} пар{lessonsCount === 1 ? "а" : lessonsCount < 5 ? "и" : ""}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground/35">вільно</span>
                                            )}

                                            {deadlinesCount > 0 && (
                                                <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-500">
                                                    {deadlinesCount} ддл
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Body grid */}
                    <div className="grid" style={{ gridTemplateColumns }}>
                        {/* Time rail */}
                        <div
                            className="sticky left-0 z-20 border-r border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
                            style={{ height: gridHeight }}
                        >
                            {hourBands.map((hour, i) => (
                                <div
                                    key={hour}
                                    className="absolute inset-x-0"
                                    style={{ top: i * 60 * PX_PER_MIN }}
                                >
                                    <div className="absolute inset-x-0 top-0 border-t border-border/50" />
                                    <span className="absolute -top-2 right-3 rounded bg-background px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground shadow-sm">
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
                                        "relative border-l border-border/60",
                                        isToday
                                            ? "bg-primary/[0.03]"
                                            : isDayWeekend
                                                ? "bg-muted/[0.12]"
                                                : "bg-background",
                                    ].join(" ")}
                                    style={{ height: gridHeight }}
                                >
                                    {/* Alternating hour bands */}
                                    {hourBands.map((_, i) => (
                                        <div
                                            key={`band-${dateStr}-${i}`}
                                            className={i % 2 === 0 ? "absolute inset-x-0 bg-muted/[0.12]" : "absolute inset-x-0 bg-transparent"}
                                            style={{
                                                top: i * 60 * PX_PER_MIN,
                                                height: 60 * PX_PER_MIN,
                                            }}
                                        />
                                    ))}

                                    {/* Hour lines */}
                                    {hours.map((_, i) => (
                                        <div
                                            key={`line-${dateStr}-${i}`}
                                            className={`absolute left-0 right-0 border-t ${
                                                i % 2 === 0 ? "border-border/50" : "border-border/20"
                                            }`}
                                            style={{ top: i * 60 * PX_PER_MIN }}
                                        />
                                    ))}

                                    {/* Today accent */}
                                    {isToday && (
                                        <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-primary/70" />
                                    )}

                                    {isToday && showNowLine && (
                                        <NowLine now={now} slotStart={slotStart} slotEnd={slotEnd} />
                                    )}

                                    {/* Empty state */}
                                    {items.length === 0 && deadlines.length === 0 && (
                                        <div className="pointer-events-none absolute inset-x-3 top-12 flex justify-center">
                                            <div className="rounded-full border border-dashed border-border/70 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                                                Вільний день
                                            </div>
                                        </div>
                                    )}

                                    {/* Lesson cards */}
                                    {items.map((inst, ii) => {
                                        const sm = toMin(inst.startsAt);
                                        const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;

                                        return (
                                            <EventCard
                                                key={`${inst.source}-${inst.id}-${ii}`}
                                                inst={inst}
                                                compact={durationToPx(sm, em) < 78}
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