import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, BrainCircuitIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { DailyDigestArtifact } from "@/modules/ai/model/types";

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
    const overview = content?.overview?.trim() ?? null;

    const stats = [
        { label: "Пар", value: content?.meta?.stats?.todayLessonsCount ?? null },
        { label: "Дедлайнів", value: content?.meta?.stats?.todayDeadlines ?? null },
        { label: "Прострочено", value: content?.meta?.stats?.overdueDeadlines ?? null },
        { label: "Сховище", value: content?.meta?.storage?.usedPercent != null ? `${content.meta.storage.usedPercent}%` : null },
    ];

    return (
        <section className="relative overflow-hidden rounded-[28px] border border-border/50 bg-card shadow-sm">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-8 -top-8 size-48 rounded-full bg-primary/8 blur-3xl" />
                <div className="absolute -bottom-8 right-8 size-40 rounded-full bg-emerald-500/6 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="relative p-5 sm:p-6">
                {/* Header row */}
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                            <SparklesIcon className="size-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                                AI-дайджест
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {format(new Date(digestDate), "d MMMM", { locale: uk })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-7 gap-1 rounded-xl text-xs">
                        <Link to="/dashboard/ai">
                            Відкрити AI
                            <ArrowRightIcon className="size-3" />
                        </Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4 rounded-lg" />
                        <Skeleton className="h-14 rounded-2xl" />
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-14 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                        {/* Main content */}
                        <div className="space-y-3">
                            {/* Focus block */}
                            <div className="rounded-2xl border border-border/40 bg-muted/20 p-4">
                                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                                    <BrainCircuitIcon className="size-3.5" />
                                    Головний фокус
                                </div>
                                <p className="text-base font-semibold leading-snug">{focus}</p>
                                {overview && (
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{overview}</p>
                                )}
                            </div>

                            {/* Alerts + Actions */}
                            {(alerts.length > 0 || actions.length > 0) && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {alerts.length > 0 && (
                                        <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
                                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                Сигнали
                                            </p>
                                            <ul className="space-y-1.5">
                                                {alerts.map((a) => (
                                                    <li key={a} className="flex items-start gap-2 text-sm">
                                                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                                                        {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {actions.length > 0 && (
                                        <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
                                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                До виконання
                                            </p>
                                            <ul className="space-y-1.5">
                                                {actions.map((a) => (
                                                    <li key={a} className="flex items-start gap-2 text-sm">
                                                        <ZapIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                        {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Empty state */}
                            {!content && (
                                <p className="text-sm text-muted-foreground">
                                    Дайджест ще не згенерований. Він з'явиться о 06:00 після запуску AI.
                                </p>
                            )}
                        </div>

                        {/* Right side stat chips */}
                        <div className="flex gap-2 xl:flex-col xl:gap-2.5">
                            {stats.map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="min-w-[72px] rounded-2xl border border-border/40 bg-muted/20 px-3 py-2.5 text-center xl:min-w-[88px]"
                                >
                                    <p className="text-lg font-bold tabular-nums leading-none">{value ?? "—"}</p>
                                    <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
