import { format } from "date-fns";
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { Deadline } from "@/entities/deadline/model/types";
import { PX_PER_MIN, toMin, minToTop, durationToPx } from "./schedule.utils";
import { TimeColumn } from "@/shared/ui/schedule/time-column";
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

export function WeekView({
    weekDays, weekdayLabels, byDate, deadlinesByDate, now,
    slotStart, slotEnd, hours, gridHeight, showNowLine, onDayClick, onLessonClick,
}: Props) {
    const todayStr = format(new Date(), "yyyy-MM-dd");

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Column headers */}
            <div className="flex border-b border-border shrink-0">
                <div className="w-14 shrink-0" />
                {weekDays.map((day, idx) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isToday = dateStr === todayStr;
                    const count = (byDate[dateStr] ?? []).length;
                    const dls = deadlinesByDate[dateStr] ?? [];
                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={[
                                "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors border-l border-border",
                                "hover:bg-muted/30 relative",
                                isToday ? "bg-primary/5" : "",
                            ].join(" ")}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                {weekdayLabels[idx]}
                            </span>

                            <div className="relative">
                                <span className={[
                                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors",
                                    isToday ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : "text-foreground",
                                ].join(" ")}>
                                    {format(day, "d")}
                                </span>
                                {dls.length > 0 && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm border border-background" title={`${dls.length} дедлайнів`} />
                                )}
                            </div>

                            {count > 0 ? (
                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                    {count} пар{count === 1 ? "а" : count < 5 ? "и" : ""}
                                </span>
                            ) : (
                                <span className="text-[10px] text-muted-foreground/30 text-transparent select-none">—</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scrollable time grid */}
            <div className="flex-1">
                <div className="flex">
                    <TimeColumn hours={hours} gridHeight={gridHeight} />
                    {weekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const items = byDate[dateStr] ?? [];
                        const isToday = dateStr === todayStr;

                        return (
                            <div
                                key={dateStr}
                                className={[
                                    "flex-1 relative border-l border-border/60",
                                    isToday ? "bg-primary/[0.025]" : "bg-background",
                                ].join(" ")}
                                style={{ height: gridHeight }}
                            >
                                {hours.map((h, i) => (
                                    <div
                                        key={h}
                                        className={`absolute left-0 right-0 border-t ${i % 2 === 0 ? "border-border/50" : "border-border/20"}`}
                                        style={{ top: i * 60 * PX_PER_MIN }}
                                    />
                                ))}

                                {isToday && showNowLine && (
                                    <NowLine now={now} slotStart={slotStart} slotEnd={slotEnd} />
                                )}

                                {items.map((inst, ii) => {
                                    const sm = toMin(inst.startsAt);
                                    const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;
                                    return (
                                        <EventCard
                                            key={`${inst.source}-${inst.id}-${ii}`}
                                            inst={inst}
                                            compact={durationToPx(sm, em) < 60}
                                            style={{ top: minToTop(sm, slotStart), height: durationToPx(sm, em) }}
                                            onClick={inst.lessonId && onLessonClick ? () => onLessonClick(inst.lessonId!) : undefined}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
