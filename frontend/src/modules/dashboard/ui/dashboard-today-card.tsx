import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, CalendarClockIcon, MapPinIcon, PlayIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { LessonInstance } from "@/modules/schedule/model/types";

function fmtTime(value: string | null | undefined) {
    return value ? value.slice(0, 5) : "—";
}

function isActive(lesson: LessonInstance, nowMin: number): boolean {
    const start = toMin(lesson.startsAt);
    const end = lesson.endsAt ? toMin(lesson.endsAt) : start + 90;
    return nowMin >= start && nowMin <= end;
}

function toMin(t: string): number {
    return parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(3, 5), 10);
}

export function DashboardTodayCard({
    lessons,
    isLoading,
}: {
    lessons: LessonInstance[];
    isLoading: boolean;
}) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const current = lessons.find((l) => isActive(l, nowMin)) ?? null;
    const next = lessons.find((l) => toMin(l.startsAt) > nowMin) ?? null;

    return (
        <div className="flex flex-col overflow-hidden rounded-[28px] border border-border/50 bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Розклад</p>
                    <h2 className="text-sm font-semibold">Сьогодні</h2>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 gap-1 rounded-xl text-xs">
                    <Link to="/dashboard/schedule/calendar">
                        Весь розклад
                        <ArrowRightIcon className="size-3" />
                    </Link>
                </Button>
            </div>

            <div className="flex-1 p-4 space-y-3">
                {isLoading ? (
                    <div className="space-y-2.5">
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-14 rounded-2xl" />
                        <Skeleton className="h-14 rounded-2xl" />
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarClockIcon className="size-9 text-muted-foreground/30" />
                        <p className="mt-3 text-sm font-medium">Пар немає</p>
                        <p className="mt-1 text-xs text-muted-foreground">Вільний день — час для самостійної роботи.</p>
                    </div>
                ) : (
                    <>
                        {/* Current/Next highlight */}
                        {(current || next) && (
                            <div className={`rounded-2xl p-4 ${current
                                ? "border border-primary/20 bg-primary/8"
                                : "border border-border/40 bg-muted/20"
                            }`}>
                                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
                                    {current ? (
                                        <>
                                            <span className="inline-flex items-center gap-1 text-primary">
                                                <PlayIcon className="size-2.5 fill-current" />
                                                Зараз
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">Наступна</span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold leading-snug">
                                    {(current ?? next)!.subject.name}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                        {fmtTime((current ?? next)!.startsAt)}
                                        {(current ?? next)!.endsAt ? ` – ${fmtTime((current ?? next)!.endsAt)}` : ""}
                                    </span>
                                    {(current ?? next)!.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPinIcon className="size-3" />
                                            {(current ?? next)!.location}
                                        </span>
                                    )}
                                    {next && !current && (
                                        <span className="text-muted-foreground/70">
                                            {formatDistanceToNow(
                                                new Date(`${next.date}T${next.startsAt}`),
                                                { addSuffix: true, locale: uk },
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* All lessons list */}
                        <div className="space-y-1.5">
                            {lessons.slice(0, 5).map((lesson) => {
                                const active = isActive(lesson, nowMin);
                                const past = toMin(lesson.startsAt) + 90 < nowMin && !active;
                                return (
                                    <div
                                        key={`${lesson.id}-${lesson.date}-${lesson.startsAt}`}
                                        className={`flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                            active
                                                ? "bg-primary/8 text-foreground"
                                                : past
                                                    ? "opacity-45"
                                                    : "hover:bg-muted/30"
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{lesson.subject.name}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {lesson.lessonType?.name ?? lesson.examType?.name ?? "Подія"}
                                                {lesson.location ? ` · ${lesson.location}` : ""}
                                            </p>
                                        </div>
                                        <p className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                                            {fmtTime(lesson.startsAt)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
