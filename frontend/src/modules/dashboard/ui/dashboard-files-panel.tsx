import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRightIcon, FileIcon, FileSpreadsheetIcon, FileTextIcon, FolderOpenIcon, PresentationIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/ui/card";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { FileItem } from "@/modules/files/model/types";
import { DashboardSectionHeading } from "./dashboard-section-heading";

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
}

function fileIcon(mimeType: string | null) {
    if (!mimeType) return FileIcon;
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileTextIcon;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheetIcon;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return PresentationIcon;
    return FileIcon;
}

export function DashboardFilesPanel({
    files,
    isLoading,
}: {
    files: FileItem[];
    isLoading: boolean;
}) {
    return (
        <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
                <DashboardSectionHeading
                    eyebrow="Файли"
                    title="Останні матеріали"
                    description="Те, з чим ти працював нещодавно."
                    action={
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                            <Link to="/dashboard/files">
                                Всі файли
                                <ArrowRightIcon className="size-3.5" />
                            </Link>
                        </Button>
                    }
                />
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading ? (
                    <>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-18 rounded-3xl" />
                        ))}
                    </>
                ) : files.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 p-6 text-center">
                        <FolderOpenIcon className="mx-auto size-8 text-muted-foreground/40" />
                        <p className="mt-3 text-sm font-medium text-foreground">Файлів поки немає</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Останні матеріали з’являться тут автоматично.
                        </p>
                    </div>
                ) : (
                    files.slice(0, 5).map((file) => {
                        const Icon = fileIcon(file.mimeType);

                        return (
                            <div
                                key={file.id}
                                className="rounded-3xl border border-border/70 bg-background px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
                                        <Icon className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">{file.originalName}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {file.subject?.name ?? "Загальне"} · {fmtSize(file.size)}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: uk })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
