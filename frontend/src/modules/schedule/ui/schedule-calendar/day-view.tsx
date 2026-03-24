import { CalendarDaysIcon, MapPinIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { LessonInstance } from "@/modules/schedule/model/types";
import type { Deadline } from "@/modules/deadlines/model/types";
import { GRID_TOP_PADDING, PX_PER_MIN, toMin, minToTop, durationToPx, fmtTime } from "./schedule.utils";
import { TimeColumn } from "@/modules/schedule/ui/time-column";
import { NowLine } from "@/modules/schedule/ui/now-line";
import { EventCard } from "@/modules/schedule/ui/event-card";

interface Props {
    dateStr: string;
    instances: LessonInstance[];
    deadlines: Deadline[];
    now: Date;
    isToday: boolean;
    slotStart: number;
    slotEnd: number;
    hours: number[];
    gridHeight: number;
    showNowLine: boolean;
    onAddLesson: () => void;
    onLessonClick?: (lessonId: number) => void;
}

export function DayView({
                            dateStr, instances, deadlines, now, isToday, slotStart, slotEnd,
                            hours, gridHeight, showNowLine, onAddLesson, onLessonClick,
                        }: Props) {
    const date = new Date(dateStr + "T12:00:00");
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // ── Empty state ───────────────────────────────────────────
    if (instances.length === 0 && deadlines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <CalendarDaysIcon className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">Вільний день</p>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {format(date, "EEEE, d MMMM", { locale: uk })} — занять немає
                    </p>
                </div>
                <button
                    onClick={onAddLesson}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Додати пару
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 overflow-hidden ">

            {/* ── Time grid ── */}
            <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 scrollbar-hidden">
                <div className="flex max-w-3xl">
                    <TimeColumn hours={hours} gridHeight={gridHeight} />

                    {/* Grid body */}
                    <div className="flex-1 relative border-l border-border/40" style={{ height: gridHeight }}>

                        {/* Hour lines */}
                        {hours.map((_, i) => (
                            <div
                                key={i}
                                className={`absolute left-0 right-0 border-t ${
                                    i % 2 === 0 ? "border-border/40" : "border-border/15"
                                }`}
                                style={{ top: GRID_TOP_PADDING + i * 60 * PX_PER_MIN }}
                            />
                        ))}

                        {/* Now line */}
                        {isToday && showNowLine && (
                            <NowLine now={now} slotStart={slotStart} slotEnd={slotEnd} />
                        )}

                        {/* Event cards */}
                        {instances.map((inst, ii) => {
                            const sm = toMin(inst.startsAt);
                            const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;
                            return (
                                <EventCard
                                    key={`${inst.source}-${inst.id}-${ii}`}
                                    inst={inst}
                                    compact={false}
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
                </div>
            </div>

            {/* ── Bottom sheet (mobile, < lg) ── */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
                <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-4 pt-2">
                    {instances.map((inst, ii) => {
                        const accent = inst.subject?.color ?? "#6366f1";
                        const endMin = inst.endsAt ? toMin(inst.endsAt) : toMin(inst.startsAt) + 90;
                        const startMin = toMin(inst.startsAt);
                        const isActive = startMin <= nowMin && endMin >= nowMin && isToday;

                        return (
                            <button
                                key={`pill-${inst.id}-${ii}`}
                                onClick={
                                    inst.lessonId && onLessonClick
                                        ? () => onLessonClick(inst.lessonId!)
                                        : undefined
                                }
                                className="flex-none flex items-center gap-2 rounded-2xl border border-border/50 bg-background/95 backdrop-blur px-3 py-2 shadow-lg shadow-black/5 text-left"
                                style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
                            >
                                <div className="min-w-0">
                                    <p className="text-[10px] tabular-nums text-muted-foreground font-medium">
                                        {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                                    </p>
                                    <p className="text-[12px] font-semibold truncate max-w-[120px]" style={{ color: accent }}>
                                        {inst.subject?.name}
                                    </p>
                                    {inst.location && (
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                                            <MapPinIcon className="size-2.5 shrink-0" />
                                            {inst.location}
                                        </p>
                                    )}
                                </div>
                                {isActive && (
                                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                                )}
                            </button>
                        );
                    })}

                    {deadlines.map(dl => (
                        <div
                            key={`pill-dl-${dl.id}`}
                            className="flex-none flex items-center gap-2 rounded-2xl border border-red-500/20 bg-background/95 backdrop-blur px-3 py-2 shadow-lg shadow-black/5"
                            style={{ borderLeftColor: "#ef4444", borderLeftWidth: 3 }}
                        >
                            <div className="min-w-0">
                                <p className="text-[10px] text-red-500 font-semibold">Дедлайн</p>
                                <p className="text-[12px] font-semibold truncate max-w-[120px] text-foreground">
                                    {dl.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    До {format(new Date(dl.dueAt), "HH:mm")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}