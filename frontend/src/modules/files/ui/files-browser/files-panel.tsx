/**
 * FilesPanel — side panel for the /files page.
 * Wraps the existing FilesRightSidebar but renders into #app-side-panel
 * instead of the old #dashboard-right-panel slot.
 */
import { PageSidePanel } from "@/shared/ui/page-side-panel"
import {
    UploadCloudIcon, FolderPlusIcon, HomeIcon,
    StarIcon, ClockIcon, TreePineIcon, HardDriveIcon,
} from "lucide-react"
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area"
import { Button } from "@/shared/shadcn/ui/button"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"
import { useFolderTree, useStorageInfo } from "@/modules/files/api/hooks"
import type { FileItem, FolderTreeNode } from "@/modules/files/model/types"
import { FolderTreeItem } from "@/modules/files/ui/folder-tree-item"
import { mimeColorMap, mimeGroup, FileTypeIcon } from "@/modules/files/ui/file-type-icon"

interface Props {
    currentFolderId: number | null
    onSelectFolder: (id: number | null, name: string) => void
    onSelectFile: (file: FileItem) => void
    onUpload: () => void
    onNewFolder: () => void
}

export function FilesPanel({
    currentFolderId, onSelectFolder, onSelectFile, onUpload, onNewFolder,
}: Props) {
    const { data: tree, isLoading } = useFolderTree()
    const { data: storage } = useStorageInfo()

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 MB"
        const mb = bytes / (1024 * 1024)
        if (mb < 1000) return `${mb.toFixed(1)} MB`
        return `${(mb / 1024).toFixed(1)} GB`
    }

    const usedFormatted = storage ? formatBytes(storage.used) : "0 MB"
    const limitFormatted = storage ? formatBytes(storage.limit) : "0 GB"
    const fillPercent = storage && storage.limit > 0
        ? Math.min(100, (storage.used / storage.limit) * 100)
        : 0

    return (
        <PageSidePanel>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Quick actions */}
                <div className="p-3 space-y-2 flex-shrink-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Дії</p>
                    <Button size="sm" className="w-full justify-start gap-2 h-8 text-xs" onClick={onUpload}>
                        <UploadCloudIcon className="size-3.5" />
                        Завантажити
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onNewFolder}
                        className="w-full justify-start gap-2 h-8 text-xs bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                    >
                        <FolderPlusIcon className="size-3.5" />
                        Нова папка
                    </Button>
                </div>

                {/*<Separator />*/}

                {/*/!* Navigation shortcuts *!/*/}
                {/*<div className="p-3 space-y-1 flex-shrink-0">*/}
                {/*    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">*/}
                {/*        Навігація*/}
                {/*    </p>*/}
                {/*    {([*/}
                {/*        { icon: HomeIcon, label: "Мої файли", folderId: null },*/}
                {/*        { icon: StarIcon, label: "Закріплені", folderId: -1 },*/}
                {/*        { icon: ClockIcon, label: "Нещодавні", folderId: -2 },*/}
                {/*    ] as const).map(({ icon: Icon, label, folderId }) => (*/}
                {/*        <Button*/}
                {/*            key={label}*/}
                {/*            variant={currentFolderId === folderId ? "secondary" : "ghost"}*/}
                {/*            size="sm"*/}
                {/*            onClick={() => folderId !== -1 && folderId !== -2 && onSelectFolder(folderId as null, label)}*/}
                {/*            className={`w-full justify-start gap-2 h-8 text-xs ${*/}
                {/*                currentFolderId === folderId*/}
                {/*                    ? "bg-primary/10 text-primary hover:bg-primary/15 font-medium"*/}
                {/*                    : "text-muted-foreground hover:text-foreground"*/}
                {/*            }`}*/}
                {/*        >*/}
                {/*            <Icon className="size-3.5" />*/}
                {/*            {label}*/}
                {/*        </Button>*/}
                {/*    ))}*/}
                {/*</div>*/}

                <Separator />

                {/* Folder tree — grows to fill */}
                <div className="flex flex-col flex-1 min-h-0 p-3 pt-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <TreePineIcon className="size-3.5 text-muted-foreground/70" />
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Дерево папок
                        </p>
                    </div>
                    <ScrollArea className="flex-1">
                        {isLoading && (
                            <div className="space-y-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 rounded-lg" />
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
                                key={`root-${file.id}`}
                                className="group flex items-center gap-1 rounded-lg pr-1 transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
                            >
                                <div className="flex shrink-0 size-5 items-center justify-center" />
                                <button
                                    onClick={() => onSelectFile(file)}
                                    className="flex flex-1 min-w-0 items-center gap-2 py-1.5"
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

                {/* Storage indicator — fixed at bottom */}
                <div className="p-3 flex-shrink-0">
                    <Separator className="mb-3" />
                    <div className="flex items-center gap-1.5 mb-2">
                        <HardDriveIcon className="size-3.5 text-muted-foreground/70" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Сховище
                        </span>
                        <span className="ml-auto text-[11px] text-muted-foreground/60">{usedFormatted} / {limitFormatted}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${fillPercent > 90 ? "bg-destructive" : fillPercent > 70 ? "bg-amber-500" : "bg-primary"}`}
                            style={{ width: `${Math.max(1, fillPercent)}%` }}
                        />
                    </div>
                </div>
            </div>
        </PageSidePanel>
    )
}
