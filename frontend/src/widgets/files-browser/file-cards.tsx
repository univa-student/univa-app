import {
    MoreVerticalIcon, PinIcon,
    DownloadIcon, PencilIcon, Trash2Icon, EyeIcon,
} from "lucide-react";
import { Button } from "@/shared/shadcn/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu";
import type { FileItem } from "@/entities/file/model/types";
import {
    FileTypeIcon, mimeColorMap, mimeGroup,
    isPreviewable, formatBytes, formatFileDate,
} from "@/shared/ui/files/file-type-icon";

interface Props {
    file: FileItem;
    onPreview: () => void;
    onDownload: () => void;
    onRename: () => void;
    onPin: () => void;
    onDelete: () => void;
}

export function FileCardGrid({ file, onPreview, onDownload, onRename, onPin, onDelete }: Props) {
    const handleClick = () => {
        if (isPreviewable(file.mimeType)) onPreview();
        else onDownload();
    };

    return (
        <div
            className="group relative flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 cursor-pointer
                transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            onClick={handleClick}
        >
            {file.isPinned && <PinIcon className="absolute top-2.5 left-2.5 size-3 text-amber-500" />}

            <div className={`flex size-11 items-center justify-center rounded-xl self-start ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                <FileTypeIcon mime={file.mimeType} />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-snug">{file.originalName}</p>
                <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <p className="text-[11px] text-muted-foreground/70 -mt-1">{formatFileDate(file.updatedAt)}</p>

            <div className="absolute top-2.5 right-2.5" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 hover:bg-background">
                            <MoreVerticalIcon className="size-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        {isPreviewable(file.mimeType) && (
                            <DropdownMenuItem onClick={onPreview}><EyeIcon className="size-4" /> Переглянути</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onDownload}><DownloadIcon className="size-4" /> Завантажити</DropdownMenuItem>
                        <DropdownMenuItem onClick={onRename}><PencilIcon className="size-4" /> Перейменувати</DropdownMenuItem>
                        <DropdownMenuItem onClick={onPin}><PinIcon className="size-4" /> {file.isPinned ? "Відкріпити" : "Закріпити"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={onDelete}><Trash2Icon className="size-4" /> Видалити</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function FileRowList({ file, onPreview, onDownload, onRename, onPin, onDelete }: Props) {
    const handleClick = () => {
        if (isPreviewable(file.mimeType)) onPreview();
        else onDownload();
    };

    return (
        <div
            className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 cursor-pointer
                transition-all duration-150 hover:border-primary/20 hover:bg-muted/30"
            onClick={handleClick}
        >
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                <FileTypeIcon mime={file.mimeType} />
            </div>
            <span className="flex-1 min-w-0 text-[13px] font-medium truncate">{file.originalName}</span>
            {file.isPinned && <PinIcon className="size-3 text-amber-500 shrink-0" />}
            <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{formatBytes(file.size)}</span>
            <span className="text-xs text-muted-foreground w-24 text-right shrink-0 hidden sm:block">{formatFileDate(file.updatedAt)}</span>

            <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 transition-opacity size-7">
                            <MoreVerticalIcon className="size-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        {isPreviewable(file.mimeType) && (
                            <DropdownMenuItem onClick={onPreview}><EyeIcon className="size-4" /> Переглянути</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onDownload}><DownloadIcon className="size-4" /> Завантажити</DropdownMenuItem>
                        <DropdownMenuItem onClick={onRename}><PencilIcon className="size-4" /> Перейменувати</DropdownMenuItem>
                        <DropdownMenuItem onClick={onPin}><PinIcon className="size-4" /> {file.isPinned ? "Відкріпити" : "Закріпити"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={onDelete}><Trash2Icon className="size-4" /> Видалити</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
