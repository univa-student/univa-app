import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import {
    UploadCloudIcon, FolderPlusIcon, HomeIcon,
    StarIcon, ClockIcon, TreePineIcon, HardDriveIcon,
} from "lucide-react";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area";
import { Button } from "@/shared/shadcn/ui/button";
import { Separator } from "@/shared/shadcn/ui/separator";
import { useFolderTree, useStorageInfo } from "@/entities/file/api/hooks";
import type { FileItem, FolderTreeNode } from "@/entities/file/model/types";
import { FolderTreeItem } from "@/shared/ui/files/folder-tree-item";
import { mimeColorMap, mimeGroup, FileTypeIcon } from "@/shared/ui/files/file-type-icon";

interface Props {
    currentFolderId: number | null;
    onSelectFolder: (id: number | null, name: string) => void;
    onSelectFile: (file: FileItem) => void;
    onUpload: () => void;
    onNewFolder: () => void;
}

export function FilesRightSidebar({
    currentFolderId, onSelectFolder, onSelectFile, onUpload, onNewFolder,
}: Props) {
    const { data: tree, isLoading } = useFolderTree();
    const { data: storage } = useStorageInfo();

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 MB";
        const mb = bytes / (1024 * 1024);
        if (mb < 1000) return `${mb.toFixed(1)} MB`;
        return `${(mb / 1024).toFixed(1)} GB`;
    };

    const usedFormatted = storage ? formatBytes(storage.used) : "0 MB";
    const limitFormatted = storage ? formatBytes(storage.limit) : "0 GB";
    const fillPercent = storage && storage.limit > 0 ? Math.min(100, (storage.used / storage.limit) * 100) : 0;

    // Portal target: the `#dashboard-right-panel` slot rendered by DashboardLayout
    // when fullHeight=true. This makes the sidebar a true sibling island instead
    // of being nested inside island-content.
    // Find the portal target AFTER React commits the DOM (getElementById during
    // render returns null on first mount because the parent hasn't been committed yet)
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    useEffect(() => {
        setPortalTarget(document.getElementById("dashboard-right-panel"));
    }, []);

    if (!portalTarget) return null;

    const content = (
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Quick actions */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Дії</p>
                <div className="space-y-2">
                    <Button
                        className="w-full justify-start gap-3 h-10 px-4 font-medium"
                        onClick={onUpload}
                    >
                        <UploadCloudIcon className="size-4" />
                        Завантажити файли
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-3 h-10 px-4 font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        onClick={onNewFolder}
                    >
                        <FolderPlusIcon className="size-4" />
                        Нова папка
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Navigation shortcuts */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Навігація</p>
                <nav className="flex flex-col gap-1">
                    <Button
                        variant={currentFolderId === null ? "secondary" : "ghost"}
                        onClick={() => onSelectFolder(null, "Мої файли")}
                        className={`w-full justify-start gap-3 h-9 px-3 ${currentFolderId === null
                            ? "bg-primary/10 text-primary hover:bg-primary/20 font-medium"
                            : "text-muted-foreground hover:text-foreground font-normal"
                        }`}
                    >
                        <HomeIcon className="size-4" />
                        <span className="truncate">Мої файли</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 px-3 text-muted-foreground hover:text-foreground font-normal"
                    >
                        <StarIcon className="size-4" />
                        <span className="truncate">Закріплені</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 px-3 text-muted-foreground hover:text-foreground font-normal"
                    >
                        <ClockIcon className="size-4" />
                        <span className="truncate">Нещодавні</span>
                    </Button>
                </nav>
            </div>

            <Separator />

            {/* Folder Tree */}
            <div className="flex flex-col flex-1 min-h-0 pt-4">
                <div className="flex items-center gap-2 px-4 mb-3">
                    <TreePineIcon className="size-4 text-muted-foreground/70" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Дерево папок</p>
                </div>
                <ScrollArea className="flex-1 px-2 pb-4">
                    {isLoading && (
                        <div className="space-y-1.5 px-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 rounded-lg" />
                            ))}
                        </div>
                    )}
                    {tree?.folders?.map((node: FolderTreeNode) => (
                        <FolderTreeItem
                            key={node.id}
                            node={node}
                            depth={0}
                            currentFolderId={currentFolderId}
                            onSelectFolder={onSelectFolder}
                            onSelectFile={onSelectFile}
                        />
                    ))}
                    {tree?.files?.map((file: FileItem) => (
                        <div
                            key={`root-file-${file.id}`}
                            className="group flex items-center gap-1 rounded-lg pr-1 transition-all duration-150 text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer"
                        >
                            <div className="flex shrink-0 size-5 items-center justify-center pointer-events-none" />
                            <button
                                onClick={() => onSelectFile(file)}
                                className="flex flex-1 min-w-0 items-center gap-2 py-1.5 text-sm"
                            >
                                <div className={`flex size-4 shrink-0 items-center justify-center rounded ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                                    <FileTypeIcon mime={file.mimeType} />
                                </div>
                                <span className="truncate text-xs font-medium">{file.originalName}</span>
                            </button>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Storage indicator */}
            <div className="p-4 mt-auto">
                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-500 opacity-20" />
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                        <HardDriveIcon className="size-4 text-foreground/70" />
                        <span>Сховище</span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-foreground">{usedFormatted}</span>
                            <span className="text-muted-foreground">з {limitFormatted}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${fillPercent > 90 ? "bg-destructive" : (fillPercent > 70 ? "bg-amber-500" : "bg-primary")}`}
                                style={{ width: `${Math.max(1, fillPercent)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, portalTarget);
}
