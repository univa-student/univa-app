import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/shadcn/ui/dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { DownloadIcon } from "lucide-react";
import type { FileItem } from "@/entities/file/model/types";
import { FileTypeIcon, mimeColorMap, mimeGroup, formatBytes, formatFileDate } from "@/shared/ui/files/file-type-icon";
import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";

function downloadUrl(fileId: number): string {
    return `${API_BASE_URL}${ENDPOINTS.files.download(fileId)}`;
}

interface Props {
    file: FileItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}

export function FilePreviewDialog({ file, open, onOpenChange }: Props) {
    if (!file) return null;
    const url = downloadUrl(file.id);
    const isImage = file.mimeType?.startsWith("image/");
    const isPdf = file.mimeType === "application/pdf";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5">
                        <div className={`flex size-8 items-center justify-center rounded-lg ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                            <FileTypeIcon mime={file.mimeType} />
                        </div>
                        <span className="truncate">{file.originalName}</span>
                        <div className="ml-auto flex items-center gap-3 text-xs font-normal text-muted-foreground shrink-0">
                            <span>{formatBytes(file.size)}</span>
                            <span>{formatFileDate(file.updatedAt)}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 rounded-xl overflow-hidden bg-muted/30 border border-border">
                    {isImage && <img src={url} alt={file.originalName} className="w-full h-full object-contain max-h-[60vh]" />}
                    {isPdf && <iframe src={url} title={file.originalName} className="w-full h-[60vh] border-0" />}
                    {!isImage && !isPdf && (
                        <div className="flex flex-col items-center justify-center gap-4 py-16">
                            <div className={`flex size-16 items-center justify-center rounded-2xl ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                                <FileTypeIcon mime={file.mimeType} />
                            </div>
                            <p className="text-sm text-muted-foreground">Попередній перегляд недоступний для цього типу файлу</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Закрити</Button>
                    <Button onClick={() => window.open(url, "_blank")}>
                        <DownloadIcon className="size-4" data-icon="inline-start" />
                        Завантажити
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
