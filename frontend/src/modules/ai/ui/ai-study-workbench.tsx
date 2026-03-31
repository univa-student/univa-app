import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    Brain,
    Check,
    FileTextIcon,
    GraduationCap,
    SearchIcon,
    SparklesIcon,
    XIcon,
} from "lucide-react";
import { useGenerateStudySummary } from "@/modules/ai/api/hooks";
import type { AiSummaryStyle } from "@/modules/ai/model/types";
import { useRecentFiles, useSearchFiles } from "@/modules/files/api/hooks";
import type { FileItem } from "@/modules/files/model/types";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Textarea } from "@/shared/shadcn/ui/textarea";

const STYLE_OPTIONS: Array<{
    value: AiSummaryStyle;
    title: string;
    description: string;
    icon: typeof FileTextIcon;
    dot: string;
}> = [
    {
        value: "standard",
        title: "Конспект",
        description: "Стислий і структурований.",
        icon: FileTextIcon,
        dot: "bg-blue-500",
    },
    {
        value: "teacher",
        title: "Як викладач",
        description: "Покроково, з акцентами.",
        icon: Brain,
        dot: "bg-violet-500",
    },
    {
        value: "beginner",
        title: "Для новачка",
        description: "Просто, без термінів.",
        icon: GraduationCap,
        dot: "bg-emerald-500",
    },
];

function fileLabel(file: FileItem) {
    return file.subject?.name ?? file.groupSubject?.name ?? "Без предмета";
}

export function AiStudyWorkbench() {
    const navigate = useNavigate();
    const generateSummary = useGenerateStudySummary();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
    const [style, setStyle] = useState<AiSummaryStyle>("standard");
    const [includeFlashcards, setIncludeFlashcards] = useState(false);
    const [notes, setNotes] = useState("");

    const { data: recentFiles, isLoading: isLoadingRecent } = useRecentFiles();
    const { data: searchResults, isFetching: isFetchingSearch } = useSearchFiles(searchQuery);

    const candidateFiles = useMemo(() => {
        if (searchQuery.length >= 2) return searchResults ?? [];
        return (recentFiles ?? []).slice(0, 8);
    }, [recentFiles, searchQuery, searchResults]);

    function isSelected(fileId: number) {
        return selectedFiles.some((f) => f.id === fileId);
    }

    function toggleFile(file: FileItem) {
        setSelectedFiles((cur) => {
            if (cur.some((f) => f.id === file.id)) return cur.filter((f) => f.id !== file.id);
            if (cur.length >= 8) return cur;
            return [...cur, file];
        });
    }

    async function handleGenerate() {
        if (selectedFiles.length === 0) return;
        const artifact = await generateSummary.mutateAsync({
            fileIds: selectedFiles.map((f) => f.id),
            style,
            includeFlashcards,
            notes,
        });
        navigate(`/dashboard/ai/summaries/${artifact.id}`);
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            {/* Back */}
            <div className="mb-5 flex items-center gap-3">
                <button
                    onClick={() => navigate("/dashboard/ai")}
                    className="flex size-8 items-center justify-center rounded-xl border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-4" />
                </button>
                <div>
                    <div className="mb-0.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <SparklesIcon className="size-3 text-primary" />
                        Новий конспект
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">Вибери файли та стиль</h1>
                </div>
            </div>

            <div className="space-y-4">
                {/* Style picker */}
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                    <div className="border-b border-border/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Стиль пояснення
                        </p>
                    </div>
                    <div className="flex p-3 gap-2">
                        {STYLE_OPTIONS.map((option) => {
                            const active = style === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStyle(option.value)}
                                    className={`flex-1 rounded-xl border px-3 py-3 text-left transition-all ${
                                        active
                                            ? "border-primary bg-primary/5"
                                            : "border-border/40 hover:bg-muted/30"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`size-2 rounded-full ${option.dot}`} />
                                        <p className="text-sm font-medium">{option.title}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* File picker */}
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                    <div className="border-b border-border/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Файли {selectedFiles.length > 0 && `· ${selectedFiles.length} обрано`}
                        </p>
                    </div>
                    <div className="p-3">
                        {/* Selected chips */}
                        {selectedFiles.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                                {selectedFiles.map((file) => (
                                    <span
                                        key={file.id}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs"
                                    >
                                        <span className="max-w-[10rem] truncate">{file.originalName}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleFile(file)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <XIcon className="size-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative mb-3">
                            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Пошук файлів..."
                                className="h-8 rounded-xl pl-8 text-sm"
                            />
                        </div>

                        {/* File list */}
                        {isLoadingRecent && searchQuery.length < 2 && (
                            <div className="space-y-1.5">
                                {[0, 1, 2].map((i) => (
                                    <Skeleton key={i} className="h-11 rounded-xl" />
                                ))}
                            </div>
                        )}

                        {!isLoadingRecent && candidateFiles.length === 0 && !isFetchingSearch && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Файли не знайдено.
                            </p>
                        )}

                        {candidateFiles.length > 0 && (
                            <div className="space-y-1">
                                {candidateFiles.map((file) => {
                                    const selected = isSelected(file.id);
                                    return (
                                        <button
                                            key={file.id}
                                            type="button"
                                            onClick={() => toggleFile(file)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                                                selected
                                                    ? "bg-primary/8"
                                                    : "hover:bg-muted/30"
                                            }`}
                                        >
                                            <div
                                                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                    selected
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-border/60"
                                                }`}
                                            >
                                                {selected && <Check className="size-3" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{file.originalName}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {fileLabel(file)}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Options */}
                <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                    <div className="border-b border-border/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Додатково
                        </p>
                    </div>
                    <div className="p-4 space-y-4">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium">Флеш-картки</p>
                                <p className="text-xs text-muted-foreground">
                                    Додати картки питання-відповідь до конспекту.
                                </p>
                            </div>
                            <div
                                className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                                    includeFlashcards ? "bg-primary" : "bg-muted"
                                }`}
                                onClick={() => setIncludeFlashcards((v) => !v)}
                            >
                                <span
                                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${
                                        includeFlashcards ? "translate-x-4" : "translate-x-0.5"
                                    }`}
                                />
                            </div>
                        </label>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Що підсвітити
                            </label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Наприклад: акцент на формули, дай прості приклади, винеси терміни..."
                                rows={3}
                                className="resize-none rounded-xl text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Generate */}
                <Button
                    className="w-full rounded-2xl"
                    size="lg"
                    onClick={() => { void handleGenerate(); }}
                    disabled={selectedFiles.length === 0 || generateSummary.isPending}
                >
                    {generateSummary.isPending ? (
                        <>
                            <SparklesIcon className="mr-2 size-4 animate-pulse" />
                            Генерую...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="mr-2 size-4" />
                            Згенерувати конспект
                            {selectedFiles.length > 0 && ` (${selectedFiles.length} файл${selectedFiles.length > 1 ? "и" : ""})`}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
