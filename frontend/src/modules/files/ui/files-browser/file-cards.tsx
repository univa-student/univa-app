import {
    MoreVerticalIcon,
    PinIcon,
    DownloadIcon,
    PencilIcon,
    Trash2Icon,
    EyeIcon,
    ScanText,
    FileText,
} from "lucide-react";

import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { FileItem } from "@/modules/files/model/types";
import {
    FileTypeIcon,
    formatBytes,
    formatFileDate,
    isPreviewable,
    mimeColorMap,
    mimeGroup,
} from "@/modules/files/ui/file-type-icon";
import { Button } from "@/shared/shadcn/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu";

interface Props {
    file: FileItem;
    onPreview: () => void;
    onDownload: () => void;
    onRename: () => void;
    onPin: () => void;
    onDelete: () => void;
    onSummarize: () => void;
    hasSummary?: boolean;
    isSummarizing?: boolean;
    downloadUrl?: string;
    canManage?: boolean;
    canSummarize?: boolean;
}

function renderMenu({
    file,
    onPreview,
    onDownload,
    onRename,
    onPin,
    onDelete,
    onSummarize,
    hasSummary,
    isSummarizing,
    canManage,
    canSummarize,
}: Omit<Props, "downloadUrl">) {
    return (
        <DropdownMenuContent align="end" className="w-52">
            {isPreviewable(file.mimeType) ? (
                <DropdownMenuItem onClick={onPreview}>
                    <EyeIcon className="size-4" />
                    Переглянути
                </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem onClick={onDownload}>
                <DownloadIcon className="size-4" />
                Завантажити
            </DropdownMenuItem>

            {canSummarize ? (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSummarize} disabled={isSummarizing}>
                        {hasSummary ? (
                            <FileText className="size-4" />
                        ) : (
                            <ScanText className="size-4" />
                        )}
                        {isSummarizing
                            ? "Генерація..."
                            : hasSummary
                              ? "Відкрити конспект"
                              : "Створити конспект"}
                    </DropdownMenuItem>
                </>
            ) : null}

            {canManage ? (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onRename}>
                        <PencilIcon className="size-4" />
                        Перейменувати
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onPin}>
                        <PinIcon className="size-4" />
                        {file.isPinned ? "Відкріпити" : "Закріпити"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={onDelete}>
                        <Trash2Icon className="size-4" />
                        Видалити
                    </DropdownMenuItem>
                </>
            ) : null}
        </DropdownMenuContent>
    );
}

export function FileCardGrid({
    file,
    onPreview,
    onDownload,
    onRename,
    onPin,
    onDelete,
    onSummarize,
    hasSummary,
    isSummarizing,
    downloadUrl,
    canManage = true,
    canSummarize = true,
}: Props) {
    const handleClick = () => {
        if (isPreviewable(file.mimeType)) onPreview();
        else onDownload();
    };

    const isImage = mimeGroup(file.mimeType) === "img";
    const imageUrl = downloadUrl ?? `${API_BASE_URL}${ENDPOINTS.files.download(file.id)}`;

    return (
        <div
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            onClick={handleClick}
        >
            {file.isPinned ? (
                <PinIcon className="absolute top-2.5 left-2.5 z-10 size-3 text-amber-500 drop-shadow-sm" />
            ) : null}

            {isImage ? (
                <div className="relative h-28 w-full border-b border-border/50 bg-muted/20">
                    <img
                        src={imageUrl}
                        alt={file.originalName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="relative flex h-28 w-full items-center justify-center border-b border-border/50 bg-muted/10">
                    <div
                        className={`flex size-14 items-center justify-center rounded-xl ${mimeColorMap[mimeGroup(file.mimeType)]}`}
                    >
                        <FileTypeIcon mime={file.mimeType} />
                    </div>
                </div>
            )}

            <div className="flex min-w-0 flex-col gap-1 bg-card p-3">
                <p
                    className="truncate text-[13px] font-semibold leading-snug"
                    title={file.originalName}
                >
                    {file.originalName}
                </p>
                <div className="mt-auto flex items-center justify-between pt-1">
                    <p className="text-[11px] text-muted-foreground">
                        {formatBytes(file.size)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                        {formatFileDate(file.updatedAt)}
                    </p>
                </div>
            </div>

            <div
                className="absolute top-2 right-2 z-10"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 rounded-lg border border-border/60 bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
                        >
                            <MoreVerticalIcon className="size-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    {renderMenu({
                        file,
                        onPreview,
                        onDownload,
                        onRename,
                        onPin,
                        onDelete,
                        onSummarize,
                        hasSummary,
                        isSummarizing,
                        canManage,
                        canSummarize,
                    })}
                </DropdownMenu>
            </div>
        </div>
    );
}

export function FileRowList({
    file,
    onPreview,
    onDownload,
    onRename,
    onPin,
    onDelete,
    onSummarize,
    hasSummary,
    isSummarizing,
    canManage = true,
    canSummarize = true,
}: Props) {
    const handleClick = () => {
        if (isPreviewable(file.mimeType)) onPreview();
        else onDownload();
    };

    return (
        <div
            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 transition-all duration-150 hover:border-primary/20 hover:bg-muted/30"
            onClick={handleClick}
        >
            <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${mimeColorMap[mimeGroup(file.mimeType)]}`}
            >
                <FileTypeIcon mime={file.mimeType} />
            </div>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                {file.originalName}
            </span>
            {file.isPinned ? (
                <PinIcon className="size-3 shrink-0 text-amber-500" />
            ) : null}
            <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                {formatBytes(file.size)}
            </span>
            <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground sm:block">
                {formatFileDate(file.updatedAt)}
            </span>

            <div
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreVerticalIcon className="size-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    {renderMenu({
                        file,
                        onPreview,
                        onDownload,
                        onRename,
                        onPin,
                        onDelete,
                        onSummarize,
                        hasSummary,
                        isSummarizing,
                        canManage,
                        canSummarize,
                    })}
                </DropdownMenu>
            </div>
        </div>
    );
}
