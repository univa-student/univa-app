import { useState, useEffect } from "react";
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

function googleViewerUrl(fileUrl: string): string {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

const DOCX_MIMES = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

interface Props {
    file: FileItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}

export function FilePreviewDialog({ file, open, onOpenChange }: Props) {
    const [iframeLoading, setIframeLoading] = useState(true);
    // Зберігаємо blob URL для PDF щоб уникнути повторного завантаження
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState(false);

    const isImage = file?.mimeType?.startsWith("image/");
    const isPdf = file?.mimeType === "application/pdf";
    const isDoc = DOCX_MIMES.includes(file?.mimeType ?? "");
    const isText = file?.mimeType === "text/plain";
    const isPreviewable = isImage || isPdf || isDoc || isText;

    // Завантажуємо PDF як blob тільки коли діалог відкритий
    useEffect(() => {
        if (!open || !file || !isPdf) {
            setPdfBlobUrl(null);
            setPdfError(false);
            setIframeLoading(true);
            return;
        }

        let objectUrl: string | null = null;

        const loadPdf = async () => {
            setIframeLoading(true);
            setPdfError(false);
            try {
                const res = await fetch(downloadUrl(file.id), {
                    // якщо є авторизація — додай credentials/headers тут
                    credentials: "include",
                });
                if (!res.ok) throw new Error("fetch failed");
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setPdfBlobUrl(objectUrl);
            } catch {
                setPdfError(true);
            } finally {
                setIframeLoading(false);
            }
        };

        loadPdf();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [open, file?.id, isPdf]);

    // Скидаємо стан при зміні файлу або закритті
    useEffect(() => {
        if (!open) {
            setIframeLoading(true);
            setPdfBlobUrl(null);
            setPdfError(false);
        }
    }, [open]);

    if (!file) return null;

    const url = downloadUrl(file.id);

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = file.originalName;
        a.click();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col gap-4 p-0 overflow-hidden">
                {/* ── Header ── */}
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

                {/* ── Preview area ── */}
                <div className="flex-1 min-h-0 mx-4 rounded-xl overflow-hidden bg-muted/30 border border-border relative">

                    {/* Image */}
                    {isImage && (
                        <img
                            src={url}
                            alt={file.originalName}
                            className="w-full h-full object-contain max-h-[65vh]"
                        />
                    )}

                    {/* PDF — завантажуємо як blob щоб обійти Content-Disposition: attachment */}
                    {isPdf && (
                        <>
                            {iframeLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                    <Loader2Icon className="size-8 animate-spin text-primary" />
                                </div>
                            )}
                            {pdfError && (
                                <div className="flex flex-col items-center justify-center gap-3 py-16">
                                    <p className="text-sm text-muted-foreground">Не вдалось завантажити PDF</p>
                                    <Button variant="outline" size="sm" onClick={handleDownload}>
                                        <DownloadIcon className="size-4 mr-2" /> Завантажити
                                    </Button>
                                </div>
                            )}
                            {pdfBlobUrl && !pdfError && (
                                <object
                                    key={pdfBlobUrl}
                                    data={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                                    type="application/pdf"
                                    className="w-full border-0"
                                    style={{ height: "65vh" }}
                                >
                                    <p className="p-4 text-sm text-muted-foreground">
                                        Ваш браузер не підтримує перегляд PDF.{" "}
                                        <button className="underline" onClick={handleDownload}>Завантажити</button>
                                    </p>
                                </object>
                            )}
                        </>
                    )}

                    {/* DOCX / PPTX / XLSX — Google Docs Viewer */}
                    {/* Примітка: Google Viewer вимагає публічно доступний URL */}
                    {isDoc && open && (
                        <>
                            {iframeLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
                                    <Loader2Icon className="size-8 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Завантаження Google Docs Viewer…</span>
                                </div>
                            )}
                            <iframe
                                key={file.id}
                                src={googleViewerUrl(url)}
                                title={file.originalName}
                                className="w-full border-0"
                                style={{ height: "65vh" }}
                                onLoad={() => setIframeLoading(false)}
                            />
                        </>
                    )}

                    {/* TXT — простий текст через fetch */}
                    {isText && open && (
                        <TextPreview fileId={file.id} url={url} />
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

                {/* ── Footer ── */}
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

// ── TXT preview sub-component ──────────────────────────────────────────────

function TextPreview({ fileId, url }: { fileId: number; url: string }) {
    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);
        fetch(url, { credentials: "include" })
            .then(r => {
                if (!r.ok) throw new Error();
                return r.text();
            })
            .then(t => setText(t))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [fileId]);

    if (loading) return (
        <div className="flex items-center justify-center" style={{ height: "65vh" }}>
            <Loader2Icon className="size-8 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center" style={{ height: "65vh" }}>
            <p className="text-sm text-muted-foreground">Не вдалось завантажити файл</p>
        </div>
    );

    return (
        <pre
            className="w-full overflow-auto p-5 text-sm font-mono text-foreground whitespace-pre-wrap break-words"
            style={{ height: "65vh" }}
        >
            {text}
        </pre>
    );
}