import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, CalendarClockIcon, Clock3Icon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/ui/card";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { LessonInstance } from "@/modules/schedule/model/types";
import { DashboardSectionHeading } from "./dashboard-section-heading";

function fmtTime(value: string | null | undefined) {
    return value ? value.slice(0, 5) : "—";
}

export function DashboardTodayCard({
    lessons,
    isLoading,
}: {
    lessons: LessonInstance[];
    isLoading: boolean;
}) {
    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const currentLesson = lessons.find((lesson) => {
        const start = parseInt(lesson.startsAt.slice(0, 2), 10) * 60 + parseInt(lesson.startsAt.slice(3, 5), 10);
        const end = lesson.endsAt
            ? parseInt(lesson.endsAt.slice(0, 2), 10) * 60 + parseInt(lesson.endsAt.slice(3, 5), 10)
            : start + 90;

        return currentMinutes >= start && currentMinutes <= end;
    }) ?? null;

    const nextLesson = lessons.find((lesson) => {
        const start = parseInt(lesson.startsAt.slice(0, 2), 10) * 60 + parseInt(lesson.startsAt.slice(3, 5), 10);
        return start > currentMinutes;
    }) ?? null;

    return (
        <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
                <DashboardSectionHeading
                    eyebrow="Розклад"
                    title="Сьогодні"
                    description="Актуальні пари та найближча подія по дню."
                    action={
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                            <Link to="/dashboard/schedule/calendar">
                                Весь розклад
                                <ArrowRightIcon className="size-3.5" />
                            </Link>
                        </Button>
                    }
                />
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-24 rounded-3xl" />
                        <Skeleton className="h-16 rounded-3xl" />
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 p-6 text-center">
                        <CalendarClockIcon className="mx-auto size-8 text-muted-foreground/40" />
                        <p className="mt-3 text-sm font-medium text-foreground">На сьогодні пар немає</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Можна спокійно зосередитися на задачах і матеріалах.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-[28px] border border-border/70 bg-muted/25 p-5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock3Icon className="size-4" />
                                Поточний стан
                            </div>
                            <p className="mt-3 text-lg font-semibold text-foreground">
                                {currentLesson
                                    ? `${currentLesson.subject.name} до ${fmtTime(currentLesson.endsAt)}`
                                    : nextLesson
                                        ? `${nextLesson.subject.name} о ${fmtTime(nextLesson.startsAt)}`
                                        : "Пари на сьогодні вже завершилися"}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {currentLesson
                                    ? `Зараз триває ${currentLesson.lessonType?.name ?? "заняття"}`
                                    : nextLesson
                                        ? `Наступна подія почнеться ${formatDistanceToNow(new Date(`${nextLesson.date}T${nextLesson.startsAt}`), { addSuffix: true, locale: uk })}`
                                        : "Завтрашній день можна підготувати без поспіху."}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {lessons.slice(0, 4).map((lesson) => (
                                <div
                                    key={`${lesson.id}-${lesson.date}-${lesson.startsAt}`}
                                    className="rounded-3xl border border-border/70 bg-background px-4 py-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground">{lesson.subject.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {lesson.lessonType?.name ?? lesson.examType?.name ?? "Подія"}
                                                {lesson.location ? ` · ${lesson.location}` : ""}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold text-foreground">
                                                {fmtTime(lesson.startsAt)}{lesson.endsAt ? ` - ${fmtTime(lesson.endsAt)}` : ""}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{lesson.source}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
