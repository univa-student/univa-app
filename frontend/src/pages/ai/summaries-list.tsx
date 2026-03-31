import { useNavigate } from "react-router-dom";
import { useDeleteSummary, useSummaries } from "@/modules/ai/api/hooks";
import type { SummaryListItem } from "@/modules/ai/model/types";
import {
    AlertCircleIcon,
    BookOpenIcon,
    ChevronRightIcon,
    FileTextIcon,
    Loader2Icon,
    PlusIcon,
    SparklesIcon,
    Trash2Icon,
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

function styleLabel(artifact: SummaryListItem) {
    const style = artifact.contentJson?.style ?? artifact.contentJson?.meta?.style;
    switch (style) {
        case "teacher": return "Викладач";
        case "beginner": return "Новачок";
        default: return "Конспект";
    }
}

function styleDot(artifact: SummaryListItem): string {
    const style = artifact.contentJson?.style ?? artifact.contentJson?.meta?.style;
    switch (style) {
        case "teacher": return "bg-violet-500";
        case "beginner": return "bg-emerald-500";
        default: return "bg-blue-500";
    }
}

function metaValue<T>(artifact: SummaryListItem, camelKey: string, snakeKey: string): T | undefined {
    const meta = artifact.contentJson?.meta as Record<string, unknown> | undefined;
    if (!meta) return undefined;
    return (meta[camelKey] as T | undefined) ?? (meta[snakeKey] as T | undefined);
}

function SummaryCard({
    artifact,
    onView,
    onDelete,
    isDeleting,
}: {
    artifact: SummaryListItem;
    onView: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const fileName = metaValue<string>(artifact, "fileName", "file_name");
    const subjectName = metaValue<string>(artifact, "subjectName", "subject_name");
    const fileCount = metaValue<Array<unknown>>(artifact, "sourceFiles", "source_files")?.length
        ?? metaValue<Array<unknown>>(artifact, "fileIds", "file_ids")?.length
        ?? 0;
    const isMultiFile = metaValue<boolean>(artifact, "isMultiFile", "is_multi_file") ?? false;

    return (
        <div className="group flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3.5 shadow-sm transition-all hover:border-border/60 hover:shadow-md">
            {/* Icon with dot */}
            <div className="relative shrink-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted/30">
                    <FileTextIcon className="size-4 text-muted-foreground/70" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-1 ring-card ${styleDot(artifact)}`} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1" onClick={onView} role="button" tabIndex={0}>
                <p className="text-sm font-semibold leading-snug line-clamp-1">{artifact.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span>{styleLabel(artifact)}</span>
                    {subjectName && <><span>·</span><span>{subjectName}</span></>}
                    {isMultiFile && fileCount > 0 && <><span>·</span><span>{fileCount} файлів</span></>}
                    {fileName && !isMultiFile && (
                        <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                <BookOpenIcon className="size-3" />
                                {fileName}
                            </span>
                        </>
                    )}
                    <span>·</span>
                    <span>{formatDate(artifact.createdAt)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    disabled={isDeleting}
                    title="Видалити"
                >
                    {isDeleting ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                        <Trash2Icon className="size-3.5" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={onView}
                    title="Відкрити"
                >
                    <ChevronRightIcon className="size-3.5" />
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
        <div className="w-full px-4 py-6 sm:px-6">
            <AiPanel />

            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <div className="mb-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <SparklesIcon className="size-3 text-primary" />
                        AI-конспекти
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Усі конспекти</h1>
                </div>
                <button
                    onClick={() => navigate("/dashboard/ai/summaries/new")}
                    className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    <PlusIcon className="size-4" />
                    Новий
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-2xl" />
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <AlertCircleIcon className="size-6" />
                    </div>
                    <p className="font-semibold">Не вдалося завантажити конспекти</p>
                    <p className="text-sm text-muted-foreground">Перевірте підключення і спробуйте ще раз.</p>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && summaries?.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/40">
                        <FileTextIcon className="size-7 text-muted-foreground/40" />
                    </div>
                    <div>
                        <p className="font-semibold">Ще немає конспектів</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Оберіть файли й згенеруй перший матеріал.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/ai/summaries/new")}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        <PlusIcon className="size-4" />
                        Створити конспект
                    </button>
                </div>
            )}

            {/* List */}
            {!isLoading && !isError && summaries && summaries.length > 0 && (
                <div className="space-y-2">
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
