import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import {
    ArrowRightIcon,
    FileIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FolderOpenIcon,
    PresentationIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { FileItem } from "@/modules/files/model/types";

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
}

function fileIcon(mimeType: string | null) {
    if (!mimeType) return FileIcon;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text"))
        return FileTextIcon;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
        return FileSpreadsheetIcon;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
        return PresentationIcon;
    return FileIcon;
}

function fileColor(mimeType: string | null): string {
    if (!mimeType) return "bg-muted/50 text-muted-foreground";
    if (mimeType.includes("pdf")) return "bg-red-500/10 text-red-500";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
        return "bg-emerald-500/10 text-emerald-500";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
        return "bg-amber-500/10 text-amber-500";
    if (mimeType.includes("document") || mimeType.includes("text"))
        return "bg-blue-500/10 text-blue-500";
    return "bg-muted/50 text-muted-foreground";
}

export function DashboardFilesPanel({
    files,
    isLoading,
}: {
    files: FileItem[];
    isLoading: boolean;
}) {
    return (
        <div className="flex flex-col overflow-hidden rounded-[28px] border border-border/50 bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Файли</p>
                    <h2 className="text-sm font-semibold">Останні матеріали</h2>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 gap-1 rounded-xl text-xs">
                    <Link to="/dashboard/files">
                        Всі файли
                        <ArrowRightIcon className="size-3" />
                    </Link>
                </Button>
            </div>

            <div className="flex-1 p-4 space-y-1.5">
                {isLoading ? (
                    <div className="space-y-2.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 rounded-2xl" />
                        ))}
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FolderOpenIcon className="size-9 text-muted-foreground/30" />
                        <p className="mt-3 text-sm font-medium">Файлів поки немає</p>
                        <p className="mt-1 text-xs text-muted-foreground">Останні матеріали з'являться тут.</p>
                    </div>
                ) : (
                    files.slice(0, 6).map((file) => {
                        const Icon = fileIcon(file.mimeType);
                        const color = fileColor(file.mimeType);

                        return (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/30"
                            >
                                <div
                                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${color}`}
                                >
                                    <Icon className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{file.originalName}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {file.subject?.name ?? "Загальне"} · {fmtSize(file.size)}
                                    </p>
                                </div>
                                <p className="shrink-0 text-xs text-muted-foreground/60">
                                    {formatDistanceToNow(new Date(file.createdAt), {
                                        addSuffix: false,
                                        locale: uk,
                                    })}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
