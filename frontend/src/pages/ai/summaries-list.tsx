import { useNavigate } from "react-router-dom";
import { useSummaries, useDeleteSummary } from "@/entities/summary/api/hooks";
import type { SummaryListItem } from "@/entities/summary/model/types";
import {
    FileText,
    Trash2,
    ChevronRight,
    Sparkles,
    ArrowLeft,
    Loader2,
    AlertCircle,
    BookOpen,
} from "lucide-react";
import { AiPanel } from "./ai-panel";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Button } from "@/shared/shadcn/ui/button";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function SummaryCard({ artifact, onView, onDelete, isDeleting }: {
    artifact: SummaryListItem;
    onView: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const fileName = artifact.contentJson?.meta?.fileName;
    const subjectName = artifact.contentJson?.meta?.subjectName;

    return (
        <div className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                    {artifact.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {subjectName && (
                        <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {subjectName}
                        </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                        {formatDate(artifact.createdAt)}
                    </span>
                    {fileName && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <BookOpen className="size-3.5" />
                            {fileName}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    disabled={isDeleting}
                    title="Видалити конспект"
                >
                    {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Trash2 className="size-4" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={onView}
                    title="Відкрити конспект"
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}

export function SummariesListPage() {
    const navigate = useNavigate();
    const { data: summaries, isLoading, isError } = useSummaries();
    const deleteMut = useDeleteSummary();

    return (
        <div className="mx-auto px-4 py-6 sm:px-6">
            <AiPanel />
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    onClick={() => navigate("/dashboard/ai")}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="min-w-0">
                    <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[11px] text-muted-foreground">
                        <Sparkles className="size-3" />
                        AI-конспекти
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">Всі конспекти</h1>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-2xl" />
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <AlertCircle className="size-7" />
                    </div>
                    <p className="font-semibold text-foreground">Не вдалося завантажити конспекти</p>
                    <p className="text-sm text-muted-foreground">Перевірте підключення і спробуйте ще раз</p>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && summaries?.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
                        <FileText className="size-8 text-muted-foreground/40" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Ще немає конспектів</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Відкрийте будь-який файл і натисніть «Створити конспект»
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/dashboard/files")}>
                        Перейти до файлів
                    </Button>
                </div>
            )}

            {/* List */}
            {!isLoading && !isError && summaries && summaries.length > 0 && (
                <div className="space-y-2.5">
                    {summaries.map((artifact) => (
                        <SummaryCard
                            key={artifact.id}
                            artifact={artifact}
                            onView={() => navigate(`/dashboard/ai/summaries/${artifact.id}`)}
                            onDelete={() => deleteMut.mutate(artifact.id)}
                            isDeleting={deleteMut.isPending && deleteMut.variables === artifact.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
