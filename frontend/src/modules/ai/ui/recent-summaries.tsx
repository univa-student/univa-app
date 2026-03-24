import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, FileText, ChevronRight, ArrowRight, Sparkles, Layers3 } from "lucide-react";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { formatRelativeDate } from "../lib/format-date";

interface Summary {
    id: number;
    title: string;
    createdAt: string;
    contentJson?: {
        meta?: { fileName?: string };
        shortSummary?: string;
    };
}

interface RecentSummariesProps {
    recent: Summary[];
    isLoading: boolean;
}

export function RecentSummaries({ recent, isLoading }: RecentSummariesProps) {
    const navigate = useNavigate();

    return (
        <section className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-foreground">Останні конспекти</p>
                    <p className="text-xs text-muted-foreground">Швидкий доступ до вже згенерованих матеріалів</p>
                </div>
                <Clock3 className="h-4 w-4 text-muted-foreground" />
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
            )}

            {!isLoading && recent.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
                        <FileText className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">Конспектів ще немає</p>
                    <button
                        onClick={() => navigate("/dashboard/files")}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        Перейти до файлів →
                    </button>
                </div>
            )}

            {!isLoading && recent.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
                    {recent.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(`/dashboard/ai/summaries/${item.id}`)}
                            className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40 ${
                                index !== recent.length - 1 ? "border-b border-border/70" : ""
                            }`}
                        >
                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                <FileText className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {item.contentJson?.meta?.fileName
                                        ? `${item.contentJson.meta.fileName} · `
                                        : ""}
                                    {formatRelativeDate(item.createdAt)}
                                </p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            )}

            {!isLoading && recent.length > 0 && (
                <button
                    onClick={() => navigate("/dashboard/ai/summaries")}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    Переглянути всі конспекти
                    <ArrowRight className="h-4 w-4" />
                </button>
            )}
        </section>
    );
}

interface FeaturedArtifactProps {
    featuredArtifact?: Summary;
    isLoading: boolean;
}

export function FeaturedArtifact({ featuredArtifact, isLoading }: FeaturedArtifactProps) {
    const navigate = useNavigate();

    return (
        <section className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-foreground">Останній AI-результат</p>
                    <p className="text-xs text-muted-foreground">Точка швидкого повернення до роботи</p>
                </div>
                <Clock3 className="h-4 w-4 text-muted-foreground" />
            </div>

            {isLoading && <Skeleton className="h-32 rounded-2xl" />}

            {!isLoading && !featuredArtifact && (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background p-6 text-center">
                    <Sparkles className="size-8 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-foreground">Ще немає результатів</p>
                    <p className="text-xs text-muted-foreground">Створіть перший конспект із файлу</p>
                </div>
            )}

            {!isLoading && featuredArtifact && (
                <button
                    onClick={() => navigate(`/dashboard/ai/summaries/${featuredArtifact.id}`)}
                    className="group w-full rounded-2xl border border-border/70 bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="mb-2 inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                Конспект
                            </div>
                            <p className="text-base font-medium text-foreground line-clamp-2">{featuredArtifact.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{formatRelativeDate(featuredArtifact.createdAt)}</p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    {featuredArtifact.contentJson?.shortSummary && (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-3">
                            {featuredArtifact.contentJson.shortSummary}
                        </p>
                    )}
                </button>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                    onClick={() => navigate("/dashboard/ai/summaries")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                    Відкрити всі конспекти
                    <Layers3 className="h-4 w-4" />
                </button>
            </div>
        </section>
    );
}
