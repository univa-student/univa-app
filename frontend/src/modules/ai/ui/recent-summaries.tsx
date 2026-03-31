import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ChevronRightIcon, FileTextIcon, PlusIcon } from "lucide-react";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { formatRelativeDate } from "../lib/format-date";
import type { SummaryListItem } from "../model/types";

interface RecentSummariesProps {
    recent: SummaryListItem[];
    isLoading: boolean;
}

function styleLabel(item: SummaryListItem) {
    const style = item.contentJson?.style ?? item.contentJson?.meta?.style;
    switch (style) {
        case "teacher": return "Викладач";
        case "beginner": return "Новачок";
        default: return "Конспект";
    }
}

function styleDot(item: SummaryListItem): string {
    const style = item.contentJson?.style ?? item.contentJson?.meta?.style;
    switch (style) {
        case "teacher": return "bg-violet-500";
        case "beginner": return "bg-emerald-500";
        default: return "bg-blue-500";
    }
}

function metaValue<T>(item: SummaryListItem, camelKey: string, snakeKey: string): T | undefined {
    const meta = item.contentJson?.meta as Record<string, unknown> | undefined;
    if (!meta) return undefined;
    return (meta[camelKey] as T | undefined) ?? (meta[snakeKey] as T | undefined);
}

export function RecentSummaries({ recent, isLoading }: RecentSummariesProps) {
    const navigate = useNavigate();

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Останні конспекти
                </p>
                {recent.length > 0 && (
                    <button
                        onClick={() => navigate("/dashboard/ai/summaries")}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Всі
                        <ArrowRightIcon className="size-3" />
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                </div>
            )}

            {!isLoading && recent.length === 0 && (
                <button
                    onClick={() => navigate("/dashboard/ai/summaries/new")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 bg-muted/10 py-8 text-sm text-muted-foreground transition-colors hover:bg-muted/20"
                >
                    <PlusIcon className="size-4" />
                    Створити перший конспект
                </button>
            )}

            {!isLoading && recent.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                    {recent.map((item, index) => {
                        const fileName = metaValue<string>(item, "fileName", "file_name");
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(`/dashboard/ai/summaries/${item.id}`)}
                                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 ${
                                    index !== recent.length - 1 ? "border-b border-border/30" : ""
                                }`}
                            >
                                <div className="relative mt-0.5 shrink-0">
                                    <FileTextIcon className="size-4 text-muted-foreground/60" />
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full ${styleDot(item)} ring-1 ring-card`}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{item.title}</p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {styleLabel(item)}
                                        {fileName ? ` · ${fileName}` : ""}
                                        {" · "}
                                        {formatRelativeDate(item.createdAt)}
                                    </p>
                                </div>
                                <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/40" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// FeaturedArtifact no longer used on home page, kept for backwards compat
export function FeaturedArtifact(_props: { featuredArtifact?: SummaryListItem; isLoading: boolean }) {
    return null;
}
