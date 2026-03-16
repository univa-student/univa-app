import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/shadcn/ui/dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { DownloadIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import type { FileItem } from "@/entities/file/model/types";
import { FileTypeIcon, mimeColorMap, mimeGroup, formatBytes, formatFileDate } from "@/shared/ui/files/file-type-icon";
import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";

function downloadUrl(fileId: number): string {
    return `${API_BASE_URL}${ENDPOINTS.files.download(fileId)}`;
}

/** Absolute URL for Google Docs Viewer (supports docx, xlsx, pptx, etc.) */
function googleViewerUrl(fileUrl: string): string {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

const DOCX_MIMES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword",                                                        // .doc
    "application/vnd.ms-powerpoint",                                             // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.ms-excel",                                                  // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        // .xlsx
];

interface Props {
    file: FileItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}

export function FilePreviewDialog({ file, open, onOpenChange }: Props) {
    const [iframeLoading, setIframeLoading] = useState(true);

    if (!file) return null;

    const url = downloadUrl(file.id);
    const isImage = file.mimeType?.startsWith("image/");
    const isPdf = file.mimeType === "application/pdf";
    const isDoc = DOCX_MIMES.includes(file.mimeType ?? "");
    const isPreviewable = isImage || isPdf || isDoc;

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = file.originalName;
        a.click();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col gap-4 p-0 overflow-hidden">
                {/* ── Header ────────────────────────────────────────────────── */}
                <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
                    <DialogTitle className="flex items-center gap-2.5">
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                            <FileTypeIcon mime={file.mimeType} />
                        </div>
                        <span className="truncate min-w-0">{file.originalName}</span>
                        <div className="ml-auto flex items-center gap-3 text-xs font-normal text-muted-foreground shrink-0">
                            <span>{formatBytes(file.size)}</span>
                            <span>{formatFileDate(file.updatedAt)}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* ── Preview area ──────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 mx-4 rounded-xl overflow-hidden bg-muted/30 border border-border relative">
                    {/* Image */}
                    {isImage && (
                        <img
                            src={url}
                            alt={file.originalName}
                            className="w-full h-full object-contain max-h-[65vh]"
                        />
                    )}

                    {/* PDF — native browser renderer */}
                    {isPdf && (
                        <>
                            {iframeLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                    <Loader2Icon className="size-8 animate-spin text-primary" />
                                </div>
                            )}
                            <iframe
                                src={`${url}#toolbar=1&navpanes=0`}
                                title={file.originalName}
                                className="w-full border-0"
                                style={{ height: "65vh" }}
                                onLoad={() => setIframeLoading(false)}
                            />
                        </>
                    )}

                    {/* DOCX / PPTX / XLSX — Google Docs Viewer */}
                    {isDoc && (
                        <>
                            {iframeLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                    <Loader2Icon className="size-8 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Завантаження Google Docs Viewer…</span>
                                </div>
                            )}
                            <iframe
                                src={googleViewerUrl(url)}
                                title={file.originalName}
                                className="w-full border-0"
                                style={{ height: "65vh" }}
                                onLoad={() => setIframeLoading(false)}
                            />
                        </>
                    )}

                    {/* Not previewable */}
                    {!isPreviewable && (
                        <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <div className={`flex size-16 items-center justify-center rounded-2xl ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                                <FileTypeIcon mime={file.mimeType} />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-sm text-foreground">Попередній перегляд недоступний</p>
                                <p className="text-xs text-muted-foreground mt-1">Цей тип файлу не підтримує вбудований перегляд</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ────────────────────────────────────────────────── */}
                <DialogFooter className="px-6 pb-5 shrink-0 flex-row justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Закрити
                    </Button>
                    <div className="flex gap-2">
                        {isDoc && (
                            <Button variant="outline" onClick={() => window.open(url, "_blank")}>
                                <ExternalLinkIcon className="size-4" />
                                Відкрити оригінал
                            </Button>
                        )}
                        <Button onClick={handleDownload}>
                            <DownloadIcon className="size-4" />
                            Завантажити
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
