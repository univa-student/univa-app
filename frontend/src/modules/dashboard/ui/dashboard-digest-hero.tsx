import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, BrainCircuitIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/shadcn/ui/button";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { DailyDigestArtifact } from "@/modules/ai/model/types";

function infoChip(label: string, value: string) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

export function DashboardDigestHero({
    digest,
    isLoading,
    fallbackFocus,
    fallbackDate,
}: {
    digest: DailyDigestArtifact | null | undefined;
    isLoading: boolean;
    fallbackFocus: string;
    fallbackDate: string;
}) {
    const content = digest?.contentJson;
    const alerts = content?.alerts?.slice(0, 3) ?? [];
    const actions = content?.actionItems?.slice(0, 3) ?? [];
    const focus = content?.focus?.trim() || fallbackFocus;
    const digestDate = content?.meta?.generatedForDate ?? fallbackDate;
    const lessonCount = content?.meta?.stats?.todayLessonsCount ?? null;
    const todayDeadlineCount = content?.meta?.stats?.todayDeadlines ?? null;
    const overdueCount = content?.meta?.stats?.overdueDeadlines ?? null;
    const storageUsedPercent = content?.meta?.storage?.usedPercent ?? null;

    return (
        <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.16),transparent_24%)]" />
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,transparent_0,transparent_31px,rgba(148,163,184,0.08)_32px),linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(148,163,184,0.08)_32px)] [background-size:32px_32px]" />

            <div className="relative grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
                                <SparklesIcon className="size-3.5" />
                                AI-дайджест дня
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Фокус на сьогодні
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Коротке AI-зведення по розкладу, дедлайнах і ресурсах без ручного перегляду всіх модулів.
                                </p>
                            </div>
                        </div>

                        <Badge variant="outline" className="rounded-full bg-background/70 px-3 py-1 text-[11px]">
                            {format(new Date(digestDate), "d MMMM", { locale: uk })}
                        </Badge>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 rounded-3xl" />
                            <Skeleton className="h-16 rounded-3xl" />
                            <Skeleton className="h-12 rounded-3xl" />
                        </div>
                    ) : (
                        <>
                            <div className="rounded-[28px] border border-border/70 bg-background/85 p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                    <BrainCircuitIcon className="size-4" />
                                    Головний фокус
                                </div>
                                <p className="text-lg font-semibold leading-7 text-foreground">{focus}</p>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {content?.overview?.trim() || "Дайджест ще не згенерований. Після ранкового запуску команди о 06:00 тут з’явиться коротке AI-зведення."}
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Сигнали
                                    </p>
                                    <div className="mt-3 space-y-2">
                                        {(alerts.length > 0 ? alerts : ["Критичних сигналів зараз немає."]).map((item) => (
                                            <div key={item} className="rounded-2xl bg-muted/60 px-3 py-2 text-sm text-foreground">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Дії
                                    </p>
                                    <div className="mt-3 space-y-2">
                                        {(actions.length > 0 ? actions : ["Відкрий дедлайни та перевір найближчі задачі."]).map((item) => (
                                            <div key={item} className="rounded-2xl bg-muted/60 px-3 py-2 text-sm text-foreground">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button asChild className="rounded-2xl">
                                    <Link to="/dashboard/deadlines">
                                        Відкрити дедлайни
                                        <ArrowRightIcon className="size-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="rounded-2xl bg-background/80">
                                    <Link to="/dashboard/schedule/calendar">
                                        Подивитися розклад
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {infoChip("Пари", lessonCount !== null ? String(lessonCount) : "—")}
                    {infoChip("Дедлайни сьогодні", todayDeadlineCount !== null ? String(todayDeadlineCount) : "—")}
                    {infoChip("Прострочені", overdueCount !== null ? String(overdueCount) : "—")}
                    {infoChip(
                        "Сховище",
                        storageUsedPercent !== null ? `${storageUsedPercent}%` : "—",
                    )}
                </div>
            </div>
        </section>
    );
}
