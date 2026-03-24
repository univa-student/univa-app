import { addDays, format } from "date-fns";
import type { LessonInstance } from "@/modules/schedule/model/types";
import type { Deadline } from "@/modules/deadlines/model/types";
import { fmtTime } from "./schedule.utils";

interface Props {
    rangeStart: Date;
    rangeEnd: Date;
    byDate: Record<string, LessonInstance[]>;
    deadlinesByDate: Record<string, Deadline[]>;
    onDayClick: (d: Date) => void;
}

export function MonthView({ rangeStart, rangeEnd, byDate, deadlinesByDate, onDayClick }: Props) {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const firstDow = (rangeStart.getDay() + 6) % 7;
    const total = rangeEnd.getDate();
    const cells = Math.ceil((firstDow + total) / 7) * 7;
    const HDRS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

    return (
        <div className="flex flex-col h-full pb-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1.5 sticky top-0 bg-background z-10">
                {HDRS.map((d, i) => (
                    <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-widest py-2 ${i >= 5 ? "text-muted-foreground/40" : "text-muted-foreground/70"}`}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: cells }).map((_, idx) => {
                    const dayIdx = idx - firstDow;
                    if (dayIdx < 0 || dayIdx >= total) {
                        return <div key={idx} className="rounded-xl min-h-[80px] bg-muted/10 border border-transparent" />;
                    }

                    const day = addDays(rangeStart, dayIdx);
                    const dateStr = format(day, "yyyy-MM-dd");
                    const items = byDate[dateStr] ?? [];
                    const dls = deadlinesByDate[dateStr] ?? [];
                    const isToday = dateStr === todayStr;
                    const dow = (day.getDay() + 6) % 7;
                    const isWeekend = dow >= 5;

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(day)}
                            className={[
                                "text-left relative rounded-xl border p-1.5 min-h-[80px] transition-all duration-100 group",
                                "hover:shadow-sm active:scale-[0.98]",
                                isToday ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 ring-offset-0" : "",
                                isWeekend && !isToday ? "bg-muted/15 border-border/30" : "",
                                !isToday && !isWeekend ? "bg-card border-border/60 hover:border-primary/25 hover:bg-muted/20" : "",
                            ].join(" ")}
                        >
                            {/* Date Number Header */}
                            <div className="flex justify-between items-start mb-1.5">
                                <div className={[
                                    "w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors",
                                    isToday ? "bg-primary text-primary-foreground" : "text-foreground/80 group-hover:bg-muted",
                                    isWeekend && !isToday ? "text-muted-foreground/50" : "",
                                ].join(" ")}>
                                    {format(day, "d")}
                                </div>
                                {dls.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1 mr-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" title={`${dls.length} дедлайнів`} />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-0.5">
                                {items.slice(0, 3).map((inst, ii) => {
                                    const accent = inst.subject?.color ?? "#6366f1";
                                    return (
                                        <div
                                            key={`${inst.id}-${ii}`}
                                            className="flex items-center gap-1 rounded-md px-1 py-0.5"
                                            style={{ backgroundColor: `${accent}18` }}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                                            <span className="text-[10px] font-semibold truncate" style={{ color: accent }}>
                                                {fmtTime(inst.startsAt)} {inst.subject?.name}
                                            </span>
                                        </div>
                                    );
                                })}
                                {items.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground pl-1">+{items.length - 3}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
