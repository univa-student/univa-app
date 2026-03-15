import { useParams, useNavigate } from "react-router-dom";
import { useSummary } from "@/entities/summary/api/hooks";
import {
    ArrowLeft,
    BookOpen,
    HelpCircle,
    Lightbulb,
    Tag,
    FileText,
    AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Button } from "@/shared/shadcn/ui/button";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function SummaryViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useSummary(Number(id));

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
                <Skeleton className="h-8 w-40 rounded-xl" />
                <Skeleton className="h-10 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-48 rounded-lg" />
                <div className="space-y-3 pt-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-36 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
                    <ArrowLeft className="size-4" />
                    Назад
                </Button>
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <AlertCircle className="size-7" />
                    </div>
                    <p className="font-semibold text-foreground">Конспект не знайдено</p>
                    <p className="text-sm text-muted-foreground">Можливо він був видалений або у вас немає доступу</p>
                </div>
            </div>
        );
    }

    const cj = data.contentJson;
    const meta = cj?.meta;

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            {/* Back button */}
            <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/ai/summaries")}
                className="mb-5 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Всі конспекти
            </Button>

            {/* Title block */}
            <div className="mb-6 rounded-[24px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        <FileText className="size-3" />
                        Конспект
                    </span>
                    {meta?.subjectName && (
                        <span className="inline-flex items-center rounded-full border border-border/60 bg-blue-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                            {meta.subjectName}
                        </span>
                    )}
                </div>

                <h1 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                    {data.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatDate(data.createdAt)}</span>
                    {meta?.fileName && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="size-3" />
                            {meta.fileName}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Short Summary */}
                {cj?.shortSummary && (
                    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                <Lightbulb className="size-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Короткий зміст</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{cj.shortSummary}</p>
                    </section>
                )}

                {/* Main Points */}
                {cj?.mainPoints && cj.mainPoints.length > 0 && (
                    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <BookOpen className="size-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Основні думки</h2>
                        </div>
                        <ul className="space-y-2">
                            {cj.mainPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                                        {i + 1}
                                    </span>
                                    <span className="leading-relaxed">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Key Terms */}
                {cj?.keyTerms && cj.keyTerms.length > 0 && (
                    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Tag className="size-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Ключові терміни</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {cj.keyTerms.map((term) => (
                                <span
                                    key={term}
                                    className="rounded-xl border border-border/70 bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                                >
                                    {term}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Possible Questions */}
                {cj?.possibleQuestions && cj.possibleQuestions.length > 0 && (
                    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <HelpCircle className="size-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Можливі запитання</h2>
                        </div>
                        <ul className="space-y-2">
                            {cj.possibleQuestions.map((q, i) => (
                                <li
                                    key={i}
                                    className="rounded-xl border border-border/50 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                                >
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}
