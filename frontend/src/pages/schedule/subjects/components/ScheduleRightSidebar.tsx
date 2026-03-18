import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
    CalendarDaysIcon, ClockIcon, MapPinIcon,
    UserIcon, PaperclipIcon, TimerIcon,
} from "lucide-react";
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area";
import { Separator } from "@/shared/shadcn/ui/separator";
import type { LessonInstance } from "@/entities/schedule/model/types";
import type { Deadline } from "@/entities/deadline/model/types";
import { fmtTime, toMin } from "@/widgets/schedule-calendar/schedule.utils";
import { LessonTypeIcon } from "@/shared/ui/schedule/lesson-type-icon";
import { ModeBadge } from "@/shared/ui/schedule/mode-badge";
import { PageSidePanel } from "@/shared/ui/page-side-panel";

interface Props {
    now: Date;
    todayStr: string;
    activeDayStr: string;
    instances: LessonInstance[];
    deadlines: Deadline[];
    nextLesson: LessonInstance | null;
    minutesUntilNext: number;
    onLessonClick?: (lessonId: number) => void;
}

export function ScheduleRightSidebar({
                                         now, todayStr, activeDayStr, instances, deadlines,
                                         nextLesson, minutesUntilNext, onLessonClick,
                                     }: Props) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const isToday = activeDayStr === todayStr;
    const date = new Date(activeDayStr + "T12:00:00");

    return (
        <PageSidePanel>
            <div className="flex flex-col flex-1 h-full overflow-hidden">

            {/* ── Header ── */}
            <div className="px-4 py-3 border-b border-border/40">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 capitalize">
                    {format(date, "EEEE, d MMMM", { locale: uk })}
                </p>
                {isToday && nextLesson && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-2.5 py-2">
                        <TimerIcon className="size-3.5 text-primary shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Наступна пара</p>
                            <p className="text-[11px] font-semibold text-primary truncate">
                                через {minutesUntilNext >= 60
                                ? `${Math.floor(minutesUntilNext / 60)}г ${minutesUntilNext % 60 > 0 ? `${minutesUntilNext % 60}хв` : ""}`
                                : `${minutesUntilNext} хв`}
                            </p>
                        </div>
                    </div>
                )}
                {isToday && !nextLesson && instances.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ClockIcon className="size-3 shrink-0" />
                        Пари завершено
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-3 pb-6">

                    {/* ── Deadlines ── */}
                    {deadlines.length > 0 && (
                        <>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500/70 px-1 mt-1">
                                Дедлайни
                            </p>
                            {deadlines.map(dl => (
                                <div
                                    key={dl.id}
                                    className="flex items-start gap-2.5 rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-2.5"
                                >
                                    <div className="mt-1 size-1.5 rounded-full bg-red-500 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold leading-tight text-foreground truncate">
                                            {dl.title}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                            <ClockIcon className="size-2.5" />
                                            До {format(new Date(dl.dueAt), "HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <Separator className="my-1" />
                        </>
                    )}

                    {/* ── Lessons ── */}
                    {instances.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CalendarDaysIcon className="size-8 text-muted-foreground/20" />
                            <p className="text-xs text-muted-foreground/50">Занять немає</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-1 mt-1">
                                Пари
                            </p>
                            {instances.map((inst, ii) => {
                                const accent = inst.subject?.color ?? "#6366f1";
                                const endMin = inst.endsAt ? toMin(inst.endsAt) : toMin(inst.startsAt) + 90;
                                const startMin = toMin(inst.startsAt);
                                const isPast = endMin < nowMin && isToday;
                                const isActive = startMin <= nowMin && endMin >= nowMin && isToday;

                                return (
                                    <button
                                        key={`sidebar-${inst.id}-${ii}`}
                                        onClick={
                                            inst.lessonId && onLessonClick
                                                ? () => onLessonClick(inst.lessonId!)
                                                : undefined
                                        }
                                        className={[
                                            "w-full rounded-xl px-3 py-2.5 text-left border transition-all duration-150",
                                            isActive
                                                ? "border-primary/30 bg-primary/5"
                                                : isPast
                                                    ? "border-border/30 bg-muted/20 opacity-50"
                                                    : "border-border/50 bg-card hover:border-border/80 hover:shadow-sm",
                                        ].join(" ")}
                                    >
                                        <div className="flex gap-2.5">
                                            <div
                                                className="w-[3px] rounded-full shrink-0 self-stretch"
                                                style={{ backgroundColor: accent, minHeight: 40 }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                                                        {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {isActive && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-px rounded-full">
                                                                Зараз
                                                            </span>
                                                        )}
                                                        {(inst.subject?.files_count ?? 0) > 0 && (
                                                            <PaperclipIcon
                                                                className="size-2.5 shrink-0"
                                                                style={{ color: `${accent}99` }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <p
                                                    className="text-[12px] font-semibold leading-tight truncate"
                                                    style={{ color: accent }}
                                                >
                                                    {inst.subject?.name}
                                                </p>
                                                <div className="mt-1.5 flex flex-col gap-0.5">
                                                    {inst.lessonType && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <LessonTypeIcon code={inst.lessonType.code} />
                                                            <span>{inst.lessonType.name}</span>
                                                        </div>
                                                    )}
                                                    {inst.location && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                                            <MapPinIcon className="size-2.5 shrink-0" />
                                                            <span className="truncate">{inst.location}</span>
                                                        </div>
                                                    )}
                                                    {inst.subject?.teacherName && (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                                            <UserIcon className="size-2.5 shrink-0" />
                                                            <span className="truncate">{inst.subject.teacherName}</span>
                                                        </div>
                                                    )}
                                                    <div className="mt-0.5">
                                                        <ModeBadge code={inst.deliveryMode?.code ?? "offline"} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
        </PageSidePanel>
    );
}