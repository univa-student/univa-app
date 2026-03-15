import { CalendarDaysIcon, MapPinIcon, PlusIcon, UserIcon, PaperclipIcon } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { Deadline } from "@/entities/deadline/model/types";
import { PX_PER_MIN, toMin, minToTop, durationToPx, fmtTime } from "./schedule.utils";
import { TimeColumn } from "@/shared/ui/schedule/time-column";
import { NowLine } from "@/shared/ui/schedule/now-line";
import { EventCard } from "@/shared/ui/schedule/event-card";
import { LessonTypeIcon } from "@/shared/ui/schedule/lesson-type-icon";
import { ModeBadge } from "@/shared/ui/schedule/mode-badge";

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

    if (instances.length === 0 && deadlines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <CalendarDaysIcon className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <div>
                    <p className="font-bold text-foreground">Вільний день</p>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {format(date, "EEEE, d MMMM", { locale: uk })} — занять та дедлайнів немає
                    </p>
                </div>
                <button
                    onClick={onAddLesson}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Додати пару
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* Time grid */}
            <div className="flex-1 min-w-0">
                <div className="flex max-w-2xl">
                    <TimeColumn hours={hours} gridHeight={gridHeight} />
                    <div className="flex-1 relative" style={{ height: gridHeight }}>
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
                        {instances.map((inst, ii) => {
                            const sm = toMin(inst.startsAt);
                            const em = inst.endsAt ? toMin(inst.endsAt) : sm + 90;
                            return (
                                <EventCard
                                    key={`${inst.source}-${inst.id}-${ii}`}
                                    inst={inst}
                                    compact={false}
                                    style={{ top: minToTop(sm, slotStart), height: durationToPx(sm, em) }}
                                    onClick={inst.lessonId && onLessonClick ? () => onLessonClick(inst.lessonId!) : undefined}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="hidden lg:flex w-60 xl:w-72 shrink-0 flex-col gap-2 pb-4 pr-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 pt-0.5 sticky top-0 bg-background z-10 block">
                    {format(date, "EEEE, d MMMM", { locale: uk })}
                </p>

                {deadlines.length > 0 && (
                    <div className="mb-4">
                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" />
                            Дедлайни ({deadlines.length})
                        </div>
                        <div className="flex flex-col gap-2">
                            {deadlines.map(dl => (
                                <div key={dl.id} className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
                                    <p className="text-xs font-bold leading-tight pl-1 text-foreground">{dl.title}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 pl-1 font-medium">
                                        До {format(new Date(dl.dueAt), "HH:mm")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {instances.map((inst, ii) => {
                    const accent = inst.subject?.color ?? "#6366f1";
                    const endMin = inst.endsAt ? toMin(inst.endsAt) : toMin(inst.startsAt) + 90;
                    const startMin = toMin(inst.startsAt);
                    const isPast = endMin < nowMin && isToday;
                    const isActive = startMin <= nowMin && endMin >= nowMin && isToday;

                    return (
                        <div
                            key={`side-${inst.id}-${ii}`}
                            className={[
                                "rounded-xl border p-3 transition-all duration-200",
                                isActive ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10" : "",
                                isPast ? "opacity-45" : "",
                                !isActive && !isPast ? "border-border/60 bg-card hover:border-border hover:shadow-sm" : "",
                            ].join(" ")}
                        >
                            <div className="flex gap-2.5">
                                <div
                                    className="w-[3px] rounded-full shrink-0 self-stretch"
                                    style={{ backgroundColor: accent, minHeight: 48 }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                                            {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                                        </span>
                                        {isActive && (
                                            <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                                                Зараз
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between gap-1">
                                        <p className="text-xs font-black leading-tight" style={{ color: accent }}>
                                            {inst.subject?.name}
                                        </p>
                                        {(inst.subject?.files_count ?? 0) > 0 && (
                                            <span title="Є матеріали" className="flex">
                                                <PaperclipIcon className="w-3 h-3 shrink-0" style={{ color: accent }} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1.5 flex flex-col gap-0.5">
                                        {inst.lessonType && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <LessonTypeIcon code={inst.lessonType.code} />
                                                {inst.lessonType.name}
                                            </div>
                                        )}
                                        {inst.location && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <MapPinIcon className="w-2.5 h-2.5 shrink-0" />
                                                {inst.location}
                                            </div>
                                        )}
                                        {inst.subject?.teacherName && (
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                                <UserIcon className="w-2.5 h-2.5 shrink-0" />
                                                {inst.subject.teacherName}
                                            </div>
                                        )}
                                        <ModeBadge code={inst.deliveryMode?.code ?? "offline"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
