import { useState, useCallback } from "react";
import {
    SearchIcon, LayoutGridIcon, LayoutListIcon,
    FolderIcon, ChevronRightIcon, HomeIcon,
} from "lucide-react";
import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/shadcn/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/shared/shadcn/ui/dropdown-menu";
import { FolderOpenIcon as FolderOpenLucide, PencilIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";

import {
    useFiles, useFolders, useUploadFile, useCreateFolder,
    useDeleteFile, useUpdateFile, useUpdateFolder, useDeleteFolder,
    useSearchFiles,
} from "@/entities/file/api/hooks";
import type { FileItem, FolderItem } from "@/entities/file/model/types";
import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";

import { isPreviewable } from "@/shared/ui/files/file-type-icon";
import { FileCardGrid, FileRowList } from "./file-cards";
import { FilesRightSidebar } from "./files-right-sidebar";
import { UploadDialog } from "@/features/files/upload-file/upload-dialog";
import { FilePreviewDialog } from "@/features/files/preview-file/file-preview-dialog";

// ── Rename Dialog ─────────────────────────────────────────────

function RenameDialog({ open, onOpenChange, type, id, currentName }: {
    open: boolean; onOpenChange: (v: boolean) => void;
    type: "file" | "folder"; id: number; currentName: string;
}) {
    const [name, setName] = useState(currentName);
    const updateFile = useUpdateFile();
    const updateFolder = useUpdateFolder();

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (type === "file") await updateFile.mutateAsync({ id, payload: { name: name.trim() } });
        else await updateFolder.mutateAsync({ id, payload: { name: name.trim() } });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className={`flex size-8 items-center justify-center rounded-lg ${type === "folder" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"}`}>
                            <PencilIcon className="size-4" />
                        </div>
                        Перейменувати {type === "folder" ? "папку" : "файл"}
                    </DialogTitle>
                </DialogHeader>
                <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className="mt-1" />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
                    <Button onClick={handleSubmit} disabled={!name.trim()}>Зберегти</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── New Folder Dialog (inline) ────────────────────────────────

function NewFolderDialog({ open, onOpenChange, parentId }: {
    open: boolean; onOpenChange: (v: boolean) => void; parentId: number | null;
}) {
    const [name, setName] = useState("");
    const createFolder = useCreateFolder();

    const handleSubmit = async () => {
        if (!name.trim()) return;
        await createFolder.mutateAsync({ name: name.trim(), parentId });
        setName("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                            <FolderOpenLucide className="size-4" />
                        </div>
                        Нова папка
                    </DialogTitle>
                </DialogHeader>
                <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="Назва папки" className="mt-1" />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
                    <Button onClick={handleSubmit} disabled={!name.trim() || createFolder.isPending}>
                        {createFolder.isPending ? "Створення..." : "Створити"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Helpers ───────────────────────────────────────────────────

function downloadUrl(fileId: number): string {
    return `${API_BASE_URL}${ENDPOINTS.files.download(fileId)}`;
}

// ── FilesBrowser Widget ───────────────────────────────────────

export function FilesBrowser() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [folderStack, setFolderStack] = useState<{ id: number | null; name: string }[]>([{ id: null, name: "Мої файли" }]);
    const currentFolderId = folderStack[folderStack.length - 1].id;

    const [showUpload, setShowUpload] = useState(false);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [renameTarget, setRenameTarget] = useState<{ type: "file" | "folder"; id: number; name: string } | null>(null);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const uploadMut = useUploadFile();
    const isSearching = searchQuery.length >= 2;

    const { data: files, isLoading: filesLoading } = useFiles(currentFolderId);
    const { data: folders, isLoading: foldersLoading } = useFolders(currentFolderId);
    const { data: searchResults } = useSearchFiles(searchQuery);
    const deleteFile = useDeleteFile();
    const updateFile = useUpdateFile();
    const deleteFolder = useDeleteFolder();

    const displayFiles = isSearching ? (searchResults ?? []) : (files ?? []);
    const displayFolders = isSearching ? [] : (folders ?? []);
    const isLoading = filesLoading || foldersLoading;
    const isEmpty = displayFiles.length === 0 && displayFolders.length === 0 && !isLoading;

    const navigateToFolder = useCallback((id: number | null, name: string) => {
        if (id === null) {
            setFolderStack([{ id: null, name: "Мої файли" }]);
        } else {
            setFolderStack(s => {
                const existingIdx = s.findIndex(c => c.id === id);
                if (existingIdx >= 0) return s.slice(0, existingIdx + 1);
                return [...s, { id, name }];
            });
        }
    }, []);

    const openFolder = useCallback((folder: FolderItem) => {
        setFolderStack(s => [...s, { id: folder.id, name: folder.name }]);
    }, []);

    const goToBreadcrumb = useCallback((index: number) => {
        setFolderStack(s => s.slice(0, index + 1));
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        for (const file of Array.from(e.dataTransfer.files)) {
            const fd = new FormData();
            fd.append("file", file);
            if (currentFolderId) fd.append("folder_id", String(currentFolderId));
            await uploadMut.mutateAsync(fd);
        }
    }, [currentFolderId, uploadMut]);

    const handleFileClick = useCallback((file: FileItem) => {
        if (isPreviewable(file.mimeType)) setPreviewFile(file);
        else window.open(downloadUrl(file.id), "_blank");
    }, []);

    return (
        <div className="flex min-h-0 flex-1 -mr-4 -mb-4">
            {/* ── Main content ───────────────────────────────────── */}
            <div className="flex flex-1 flex-col min-w-0 p-5 pr-8 gap-4">
                {/* Header */}
                <div className="flex items-center gap-3 flex-wrap">
                    <nav className="flex items-center gap-1 text-sm mr-auto flex-wrap">
                        {folderStack.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <ChevronRightIcon className="size-3.5 text-border" />}
                                {i < folderStack.length - 1 ? (
                                    <button onClick={() => goToBreadcrumb(i)} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                                        {i === 0 && <HomeIcon className="size-3.5" />}
                                        {crumb.name}
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1.5 font-semibold text-foreground px-1.5 py-0.5">
                                        {i === 0 && <HomeIcon className="size-3.5" />}
                                        {crumb.name}
                                    </span>
                                )}
                            </span>
                        ))}
                    </nav>

                    <div className="relative min-w-[220px] max-w-[320px] w-full">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input placeholder="Пошук файлів..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
                    </div>

                    <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                        {viewMode === "grid" ? <LayoutListIcon className="size-3.5" /> : <LayoutGridIcon className="size-3.5" />}
                    </Button>
                </div>

                {/* List header */}
                {viewMode === "list" && !isEmpty && !isLoading && (
                    <div className="flex items-center gap-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 select-none">
                        <div className="size-8 shrink-0" />
                        <span className="flex-1">Назва</span>
                        <span className="w-16 text-right">Розмір</span>
                        <span className="w-24 text-right hidden sm:block">Змінено</span>
                        <div className="size-7 shrink-0" />
                    </div>
                )}

                {/* Drop zone + content */}
                <div
                    className={`relative flex-1 min-h-[200px] rounded-2xl transition-all duration-200 ${dragOver ? "bg-primary/4 ring-2 ring-dashed ring-primary/40 ring-offset-2" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    {isLoading && (
                        <div className={`grid gap-3 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className={viewMode === "grid" ? "h-32 rounded-xl" : "h-12 rounded-xl"} />
                            ))}
                        </div>
                    )}

                    {!isLoading && isEmpty && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
                                <FolderIcon className="size-8 text-muted-foreground/30" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Тут порожньо</p>
                                <p className="text-sm text-muted-foreground mt-1">Завантажте файли або створіть папку</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !isEmpty && (
                        <div className={`${viewMode === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-1.5"}`}>
                            {/* Folders */}
                            {displayFolders.map(folder => (
                                <div
                                    key={`folder-${folder.id}`}
                                    className={`${viewMode === "grid"
                                        ? "group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-sm hover:bg-amber-500/5"
                                        : "group flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 cursor-pointer transition-all hover:border-amber-500/30 hover:bg-muted/30"
                                        }`}
                                    onClick={() => openFolder(folder)}
                                >
                                    {viewMode === "grid" ? (
                                        <>
                                            <div className="flex items-start justify-between">
                                                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                                    <FolderIcon fill="currentColor" className="size-5" />
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                                                                <MoreHorizontalIcon className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget({ type: "folder", id: folder.id, name: folder.name }); }}>
                                                                <PencilIcon className="mr-2 size-4" />
                                                                <span>Перейменувати</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); deleteFolder.mutate(folder.id); }}>
                                                                <Trash2Icon className="mr-2 size-4" />
                                                                <span>Видалити</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <span className="font-semibold text-foreground text-[13px] line-clamp-1">{folder.name}</span>
                                                <span className="text-[11px] text-muted-foreground mt-0.5 block">{new Date(folder.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                                                <FolderIcon fill="currentColor" className="size-4" />
                                            </div>
                                            <span className="font-medium text-[13px] text-foreground flex-1 truncate">{folder.name}</span>
                                            <span className="text-xs text-muted-foreground hidden sm:block w-24 text-right">
                                                {new Date(folder.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className="ml-auto" onClick={e => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontalIcon className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget({ type: "folder", id: folder.id, name: folder.name }); }}>
                                                            <PencilIcon className="mr-2 size-4" />
                                                            <span>Перейменувати</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); deleteFolder.mutate(folder.id); }}>
                                                            <Trash2Icon className="mr-2 size-4" />
                                                            <span>Видалити</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Files */}
                            {displayFiles.map(file =>
                                viewMode === "grid" ? (
                                    <FileCardGrid
                                        key={file.id}
                                        file={file}
                                        onPreview={() => setPreviewFile(file)}
                                        onDownload={() => window.open(downloadUrl(file.id), "_blank")}
                                        onRename={() => setRenameTarget({ type: "file", id: file.id, name: file.originalName })}
                                        onPin={() => updateFile.mutate({ id: file.id, payload: { isPinned: !file.isPinned } })}
                                        onDelete={() => deleteFile.mutate(file.id)}
                                    />
                                ) : (
                                    <FileRowList
                                        key={file.id}
                                        file={file}
                                        onPreview={() => setPreviewFile(file)}
                                        onDownload={() => window.open(downloadUrl(file.id), "_blank")}
                                        onRename={() => setRenameTarget({ type: "file", id: file.id, name: file.originalName })}
                                        onPin={() => updateFile.mutate({ id: file.id, payload: { isPinned: !file.isPinned } })}
                                        onDelete={() => deleteFile.mutate(file.id)}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right sidebar ───────────────────────────────────── */}
            <FilesRightSidebar
                currentFolderId={currentFolderId}
                onSelectFolder={navigateToFolder}
                onSelectFile={handleFileClick}
                onUpload={() => setShowUpload(true)}
                onNewFolder={() => setShowNewFolder(true)}
            />

            {/* ── Dialogs ────────────────────────────────────────── */}
            <UploadDialog open={showUpload} onOpenChange={setShowUpload} folderId={currentFolderId} />
            <NewFolderDialog open={showNewFolder} onOpenChange={setShowNewFolder} parentId={currentFolderId} />
            <FilePreviewDialog file={previewFile} open={!!previewFile} onOpenChange={(v) => !v && setPreviewFile(null)} />
            {renameTarget && (
                <RenameDialog
                    open={!!renameTarget}
                    onOpenChange={(v) => !v && setRenameTarget(null)}
                    type={renameTarget.type}
                    id={renameTarget.id}
                    currentName={renameTarget.name}
                />
            )}
        </div>
    );
}
