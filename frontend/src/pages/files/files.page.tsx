import React, { useState, useCallback, useRef } from "react";
import {
    SearchIcon, UploadCloudIcon, FolderPlusIcon, LayoutGridIcon, LayoutListIcon,
    FolderIcon, FolderOpenIcon, FileTextIcon, ImageIcon, FileSpreadsheetIcon,
    PresentationIcon, ArchiveIcon, FileIcon, PinIcon,
    ChevronRightIcon, HomeIcon, DownloadIcon, PencilIcon,
    Trash2Icon, UploadIcon, EyeIcon, MoreVerticalIcon, HardDriveIcon,
    StarIcon, ClockIcon, TreePineIcon,
} from "lucide-react";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/shadcn/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area";
import {
    useFiles, useFolders, useUploadFile, useCreateFolder,
    useDeleteFile, useUpdateFile, useDeleteFolder, useUpdateFolder,
    useSearchFiles, useFolderTree,
} from "@/entities/file/api/hooks";
import type { FileItem, FolderItem, FolderTreeNode } from "@/entities/file/model/types";
import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}

function downloadUrl(fileId: number): string {
    return `${API_BASE_URL}${ENDPOINTS.files.download(fileId)}`;
}

type MimeGroup = "img" | "pdf" | "doc" | "xls" | "ppt" | "zip" | "other";

function mimeGroup(mime: string | null): MimeGroup {
    if (!mime) return "other";
    if (mime.startsWith("image/")) return "img";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("word") || mime.includes("document")) return "doc";
    if (mime.includes("sheet") || mime.includes("excel")) return "xls";
    if (mime.includes("presentation") || mime.includes("powerpoint")) return "ppt";
    if (mime.includes("zip") || mime.includes("compressed") || mime.includes("archive")) return "zip";
    return "other";
}

function isPreviewable(mime: string | null): boolean {
    if (!mime) return false;
    return mime.startsWith("image/") || mime === "application/pdf";
}

const mimeColorMap: Record<MimeGroup, string> = {
    pdf:   "bg-red-500/12 text-red-600 dark:text-red-400",
    doc:   "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    xls:   "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    ppt:   "bg-orange-500/12 text-orange-600 dark:text-orange-400",
    img:   "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    zip:   "bg-slate-500/12 text-slate-600 dark:text-slate-400",
    other: "bg-muted text-muted-foreground",
};

function FileTypeIcon({ mime }: { mime: string | null }) {
    const g = mimeGroup(mime);
    const cls = "size-4";
    if (g === "img") return <ImageIcon className={cls} />;
    if (g === "pdf") return <FileTextIcon className={cls} />;
    if (g === "doc") return <FileTextIcon className={cls} />;
    if (g === "xls") return <FileSpreadsheetIcon className={cls} />;
    if (g === "ppt") return <PresentationIcon className={cls} />;
    if (g === "zip") return <ArchiveIcon className={cls} />;
    return <FileIcon className={cls} />;
}

// ─── Folder Tree Item ────────────────────────────────────────────────────────

function FolderTreeItem({ node, depth, currentFolderId, onSelectFolder, onSelectFile }: {
    node: FolderTreeNode;
    depth: number;
    currentFolderId: number | null;
    onSelectFolder: (id: number | null, name: string) => void;
    onSelectFile: (file: FileItem) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const isActive = currentFolderId === node.id;
    const hasChildren = (node.folders?.length ?? 0) > 0;
    const hasFiles = (node.files?.length ?? 0) > 0;
    const hasContent = hasChildren || hasFiles;
    const fileCount = (node.files?.length ?? 0) + (node.files?.length ?? 0);

    return (
        <div>
            <div
                className={`group flex items-center gap-1 rounded-lg pr-1 transition-all duration-150
                    ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60"
                }`}
                style={{ paddingLeft: `${depth * 12 + 4}px` }}
            >
                <button
                    onClick={() => hasContent && setExpanded(!expanded)}
                    className={`flex shrink-0 size-5 items-center justify-center rounded transition-colors hover:bg-muted
                        ${!hasContent ? "invisible" : ""}`}
                >
                    <ChevronRightIcon
                        className={`size-3 text-muted-foreground transition-transform duration-200
                            ${expanded ? "rotate-90" : ""}`}
                    />
                </button>

                <button
                    onClick={() => onSelectFolder(node.id, node.name)}
                    className="flex flex-1 min-w-0 items-center gap-2 py-1.5 text-sm"
                >
                    {expanded
                        ? <FolderOpenIcon className="size-4 shrink-0 text-amber-500" />
                        : <FolderIcon className={`size-4 shrink-0 ${isActive ? "text-amber-500" : "text-amber-400/70"}`} />
                    }
                    <span className={`truncate text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}>
                        {node.name}
                    </span>
                    {fileCount > 0 && (
                        <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:bg-background">
                            {fileCount}
                        </span>
                    )}
                </button>
            </div>

            {expanded && (
                <div className="relative">
                    {/* Vertical connector line */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-border/60"
                        style={{ left: `${depth * 12 + 14}px` }}
                    />
                    {node.folders?.map((child: FolderTreeNode) => (
                        <FolderTreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            currentFolderId={currentFolderId}
                            onSelectFolder={onSelectFolder}
                            onSelectFile={onSelectFile}
                        />
                    ))}
                    {node.files?.map((file: FileItem) => (
                        <div
                            key={`tree-file-${file.id}`}
                            onClick={() => onSelectFile(file)}
                            className="flex items-center gap-2 rounded-lg py-1 pr-1 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
                            style={{ paddingLeft: `${(depth + 1) * 12 + 22}px` }}
                        >
                            <div className={`flex size-4 shrink-0 items-center justify-center rounded ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                                <FileTypeIcon mime={file.mimeType} />
                            </div>
                            <span className="truncate text-[12px]">{file.originalName}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Right Sidebar ───────────────────────────────────────────────────────────

function RightSidebar({ currentFolderId, onSelectFolder, onSelectFile, onUpload, onNewFolder }: {
    currentFolderId: number | null;
    onSelectFolder: (id: number | null, name: string) => void;
    onSelectFile: (file: FileItem) => void;
    onUpload: () => void;
    onNewFolder: () => void;
}) {
    const { data: tree, isLoading } = useFolderTree();

    return (
        <aside className="w-64 shrink-0 flex flex-col border-l border-border/60 bg-muted/20">
            {/* Quick actions */}
            <div className="p-3 border-b border-border/60 space-y-1.5">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Дії
                </p>
                <button
                    onClick={onUpload}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/8 hover:text-primary transition-colors group"
                >
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                        <UploadCloudIcon className="size-3.5" />
                    </div>
                    Завантажити файли
                </button>
                <button
                    onClick={onNewFolder}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-amber-500/8 hover:text-amber-600 transition-colors group"
                >
                    <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/15 transition-colors">
                        <FolderPlusIcon className="size-3.5" />
                    </div>
                    Нова папка
                </button>
            </div>

            {/* Navigation shortcuts */}
            <div className="p-3 border-b border-border/60 space-y-0.5">
                <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Навігація
                </p>
                <button
                    onClick={() => onSelectFolder(null, "Мої файли")}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors
                        ${currentFolderId === null
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted/60 font-medium"}`}
                >
                    <HomeIcon className="size-4 shrink-0" />
                    <span>Мої файли</span>
                </button>
                <button className="w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
                    <StarIcon className="size-4 shrink-0" />
                    <span>Закріплені</span>
                </button>
                <button className="w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
                    <ClockIcon className="size-4 shrink-0" />
                    <span>Нещодавні</span>
                </button>
            </div>

            {/* Folder Tree */}
            <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center gap-1.5 px-5 py-2.5">
                    <TreePineIcon className="size-3.5 text-muted-foreground/60" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        Дерево папок
                    </p>
                </div>
                <ScrollArea className="flex-1 px-3 pb-3">
                    {isLoading && (
                        <div className="space-y-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-7 rounded-lg" />
                            ))}
                        </div>
                    )}
                    {!isLoading && (!tree || tree.folders.length === 0) && (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <FolderIcon className="size-8 text-muted-foreground/30" />
                            <p className="text-xs text-muted-foreground">Папок ще немає</p>
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
                            onClick={() => onSelectFile(file)}
                            className="flex items-center gap-2 rounded-lg py-1 px-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
                        >
                            <div className={`flex size-4 shrink-0 items-center justify-center rounded ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                                <FileTypeIcon mime={file.mimeType} />
                            </div>
                            <span className="truncate text-[12px]">{file.originalName}</span>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Storage indicator (decorative) */}
            <div className="p-3 border-t border-border/60">
                <div className="rounded-lg bg-muted/60 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                            <HardDriveIcon className="size-3.5" />
                            <span>Сховище</span>
                        </div>
                        <span className="text-foreground font-semibold">2.4 / 10 GB</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: "24%" }}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground">76% вільно</p>
                </div>
            </div>
        </aside>
    );
}

// ─── File Preview Dialog ─────────────────────────────────────────────────────

function FilePreviewDialog({ file, open, onOpenChange }: {
    file: FileItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
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
                            <span>{formatDate(file.updatedAt)}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 rounded-xl overflow-hidden bg-muted/30 border border-border">
                    {isImage && (
                        <img src={url} alt={file.originalName} className="w-full h-full object-contain max-h-[60vh]" />
                    )}
                    {isPdf && (
                        <iframe src={url} title={file.originalName} className="w-full h-[60vh] border-0" />
                    )}
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

// ─── Upload Dialog ────────────────────────────────────────────────────────────

function UploadDialog({ open, onOpenChange, folderId }: {
    open: boolean; onOpenChange: (v: boolean) => void; folderId: number | null;
}) {
    const upload = useUploadFile();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        setUploading(true);
        for (const file of Array.from(files)) {
            const fd = new FormData();
            fd.append("file", file);
            if (folderId) fd.append("folder_id", String(folderId));
            try { await upload.mutateAsync(fd); } catch { /* handled */ }
        }
        setUploading(false);
        onOpenChange(false);
    }, [folderId, upload, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Завантажити файли</DialogTitle>
                </DialogHeader>
                <div
                    className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer
                        ${dragActive
                        ? "border-primary bg-primary/5 scale-[0.99]"
                        : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/3"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className={`flex size-14 items-center justify-center rounded-2xl transition-colors
                        ${dragActive ? "bg-primary/15" : "bg-primary/10"}`}>
                        <UploadIcon className="size-6 text-primary" />
                    </div>
                    {uploading ? (
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm font-medium">Завантаження...</p>
                            <p className="text-xs text-muted-foreground">Будь ласка, зачекайте</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                            <p className="text-sm font-medium">Перетягніть файли сюди</p>
                            <p className="text-xs text-muted-foreground">
                                або{" "}
                                <span className="font-semibold text-primary underline underline-offset-2 cursor-pointer">
                                    виберіть файли
                                </span>
                                {" "}з комп'ютера
                            </p>
                        </div>
                    )}
                </div>
                <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </DialogContent>
        </Dialog>
    );
}

// ─── New Folder Dialog ────────────────────────────────────────────────────────

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
                            <FolderPlusIcon className="size-4" />
                        </div>
                        Нова папка
                    </DialogTitle>
                </DialogHeader>
                <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Назва папки"
                    className="mt-1"
                />
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

// ─── Rename Dialog ────────────────────────────────────────────────────────────

function RenameDialog({ open, onOpenChange, type, id, currentName }: {
    open: boolean; onOpenChange: (v: boolean) => void;
    type: "file" | "folder"; id: number; currentName: string;
}) {
    const [name, setName] = useState(currentName);
    const updateFile = useUpdateFile();
    const updateFolder = useUpdateFolder();

    const handleSubmit = async () => {
        if (!name.trim()) return;
        if (type === "file") {
            await updateFile.mutateAsync({ id, payload: { name: name.trim() } });
        } else {
            await updateFolder.mutateAsync({ id, payload: { name: name.trim() } });
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className={`flex size-8 items-center justify-center rounded-lg
                            ${type === "folder" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"}`}>
                            <PencilIcon className="size-4" />
                        </div>
                        Перейменувати {type === "folder" ? "папку" : "файл"}
                    </DialogTitle>
                </DialogHeader>
                <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="mt-1"
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
                    <Button onClick={handleSubmit} disabled={!name.trim()}>Зберегти</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── File Card (Grid) ─────────────────────────────────────────────────────────

function FileCardGrid({ file, onPreview, onDownload, onRename, onPin, onDelete }: {
    file: FileItem;
    onPreview: () => void;
    onDownload: () => void;
    onRename: () => void;
    onPin: () => void;
    onDelete: () => void;
}) {
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
            {file.isPinned && (
                <PinIcon className="absolute top-2.5 left-2.5 size-3 text-amber-500" />
            )}

            {/* Mime icon */}
            <div className={`flex size-11 items-center justify-center rounded-xl self-start
                ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                <FileTypeIcon mime={file.mimeType} />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-snug">{file.originalName}</p>
                <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
            </div>

            <p className="text-[11px] text-muted-foreground/70 -mt-1">{formatDate(file.updatedAt)}</p>

            {/* Menu */}
            <div
                className="absolute top-2.5 right-2.5"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 hover:bg-background"
                        >
                            <MoreVerticalIcon className="size-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        {isPreviewable(file.mimeType) && (
                            <DropdownMenuItem onClick={onPreview}>
                                <EyeIcon className="size-4" /> Переглянути
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onDownload}>
                            <DownloadIcon className="size-4" /> Завантажити
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onRename}>
                            <PencilIcon className="size-4" /> Перейменувати
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onPin}>
                            <PinIcon className="size-4" /> {file.isPinned ? "Відкріпити" : "Закріпити"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={onDelete}>
                            <Trash2Icon className="size-4" /> Видалити
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

// ─── File Row (List) ──────────────────────────────────────────────────────────

function FileRowList({ file, onPreview, onDownload, onRename, onPin, onDelete }: {
    file: FileItem;
    onPreview: () => void;
    onDownload: () => void;
    onRename: () => void;
    onPin: () => void;
    onDelete: () => void;
}) {
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
            <span className="text-xs text-muted-foreground w-24 text-right shrink-0 hidden sm:block">{formatDate(file.updatedAt)}</span>

            <div
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export function FilesPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [folderStack, setFolderStack] = useState<{ id: number | null; name: string }[]>([
        { id: null, name: "Мої файли" },
    ]);
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
    const deleteFolder = useDeleteFolder();
    const updateFile = useUpdateFile();

    const displayFiles = isSearching ? (searchResults ?? []) : (files ?? []);
    const displayFolders = isSearching ? [] : (folders ?? []);
    const isLoading = filesLoading || foldersLoading;
    const isEmpty = displayFiles.length === 0 && displayFolders.length === 0 && !isLoading;

    const navigateToFolder = useCallback((id: number | null, name: string) => {
        if (id === null) {
            setFolderStack([{ id: null, name: "Мої файли" }]);
        } else {
            setFolderStack((s) => {
                const existingIdx = s.findIndex((c) => c.id === id);
                if (existingIdx >= 0) return s.slice(0, existingIdx + 1);
                return [...s, { id, name }];
            });
        }
    }, []);

    const openFolder = useCallback((folder: FolderItem) => {
        setFolderStack((s) => [...s, { id: folder.id, name: folder.name }]);
    }, []);

    const goToBreadcrumb = useCallback((index: number) => {
        setFolderStack((s) => s.slice(0, index + 1));
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
        <div className="flex min-h-0 flex-1">
            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col min-w-0 p-5 gap-4">
                {/* Header row */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1 text-sm mr-auto flex-wrap">
                        {folderStack.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <ChevronRightIcon className="size-3.5 text-border" />}
                                {i < folderStack.length - 1 ? (
                                    <button
                                        onClick={() => goToBreadcrumb(i)}
                                        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                    >
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

                    {/* Search + view toggle */}
                    <div className="relative min-w-[220px] max-w-[320px] w-full">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Пошук файлів..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-sm"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        title={viewMode === "grid" ? "Список" : "Сітка"}
                    >
                        {viewMode === "grid"
                            ? <LayoutListIcon className="size-3.5" />
                            : <LayoutGridIcon className="size-3.5" />
                        }
                    </Button>
                </div>

                {/* List header (only in list mode) */}
                {viewMode === "list" && !isEmpty && !isLoading && (
                    <div className="flex items-center gap-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 select-none">
                        <div className="size-8 shrink-0" />
                        <span className="flex-1">Назва</span>
                        <span className="w-16 text-right">Розмір</span>
                        <span className="w-24 text-right hidden sm:block">Змінено</span>
                        <div className="size-7 shrink-0" />
                    </div>
                )}

                {/* Drop zone */}
                <div
                    className={`relative flex-1 min-h-[200px] rounded-2xl transition-all duration-200
                        ${dragOver ? "bg-primary/4 ring-2 ring-dashed ring-primary/40 ring-offset-2" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    {dragOver && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-primary/6 backdrop-blur-sm pointer-events-none">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15">
                                <UploadCloudIcon className="size-8 text-primary animate-bounce" />
                            </div>
                            <p className="font-semibold text-primary">Перетягніть файли для завантаження</p>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className={viewMode === "grid"
                            ? "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3"
                            : "flex flex-col gap-1.5"}
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className={viewMode === "grid" ? "h-[148px] rounded-xl" : "h-11 rounded-xl"} />
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {isEmpty && !isLoading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                            <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/60">
                                <FolderIcon className="size-9 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold">
                                    {isSearching ? "Файлів не знайдено" : "Тут поки порожньо"}
                                </h3>
                                <p className="max-w-xs text-sm text-muted-foreground">
                                    {isSearching
                                        ? "Спробуйте змінити пошуковий запит"
                                        : "Завантажте файли або створіть папку для організації матеріалів"}
                                </p>
                            </div>
                            {!isSearching && (
                                <div className="flex gap-2 mt-1">
                                    <Button variant="outline" onClick={() => setShowNewFolder(true)}>
                                        <FolderPlusIcon className="size-4" data-icon="inline-start" />
                                        Нова папка
                                    </Button>
                                    <Button onClick={() => setShowUpload(true)}>
                                        <UploadCloudIcon className="size-4" data-icon="inline-start" />
                                        Завантажити файли
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    {!isEmpty && !isLoading && (
                        <div className={viewMode === "grid"
                            ? "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3"
                            : "flex flex-col gap-1.5"}
                        >
                            {/* Folders */}
                            {displayFolders.map((folder) => (
                                viewMode === "grid" ? (
                                    <div
                                        key={`folder-${folder.id}`}
                                        className="group relative flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 cursor-pointer
                                            transition-all duration-200 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5"
                                        onClick={() => openFolder(folder)}
                                    >
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                                            <FolderIcon className="size-5" />
                                        </div>
                                        <p className="text-[13px] font-semibold truncate">{folder.name}</p>
                                        <div
                                            className="absolute top-2.5 right-2.5"
                                            onClick={(e) => e.stopPropagation()}
                                            onPointerDown={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60"
                                                    >
                                                        <MoreVerticalIcon className="size-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => setRenameTarget({ type: "folder", id: folder.id, name: folder.name })}>
                                                        <PencilIcon className="size-4" /> Перейменувати
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem variant="destructive" onClick={() => deleteFolder.mutate(folder.id)}>
                                                        <Trash2Icon className="size-4" /> Видалити
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key={`folder-${folder.id}`}
                                        className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 cursor-pointer
                                            transition-all duration-150 hover:border-amber-400/30 hover:bg-amber-500/3"
                                        onClick={() => openFolder(folder)}
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-400">
                                            <FolderIcon className="size-4" />
                                        </div>
                                        <span className="flex-1 min-w-0 text-[13px] font-medium truncate">{folder.name}</span>
                                        <ChevronRightIcon className="size-4 text-muted-foreground/40 shrink-0" />
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            onPointerDown={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 transition-opacity size-7">
                                                        <MoreVerticalIcon className="size-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => setRenameTarget({ type: "folder", id: folder.id, name: folder.name })}>
                                                        <PencilIcon className="size-4" /> Перейменувати
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem variant="destructive" onClick={() => deleteFolder.mutate(folder.id)}>
                                                        <Trash2Icon className="size-4" /> Видалити
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )
                            ))}

                            {/* Files */}
                            {displayFiles.map((file) => (
                                viewMode === "grid" ? (
                                    <FileCardGrid
                                        key={`file-${file.id}`}
                                        file={file}
                                        onPreview={() => setPreviewFile(file)}
                                        onDownload={() => window.open(downloadUrl(file.id), "_blank")}
                                        onRename={() => setRenameTarget({ type: "file", id: file.id, name: file.originalName })}
                                        onPin={() => updateFile.mutate({ id: file.id, payload: { isPinned: !file.isPinned } })}
                                        onDelete={() => deleteFile.mutate(file.id)}
                                    />
                                ) : (
                                    <FileRowList
                                        key={`file-${file.id}`}
                                        file={file}
                                        onPreview={() => setPreviewFile(file)}
                                        onDownload={() => window.open(downloadUrl(file.id), "_blank")}
                                        onRename={() => setRenameTarget({ type: "file", id: file.id, name: file.originalName })}
                                        onPin={() => updateFile.mutate({ id: file.id, payload: { isPinned: !file.isPinned } })}
                                        onDelete={() => deleteFile.mutate(file.id)}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right Sidebar ─────────────────────────────────────────── */}
            <RightSidebar
                currentFolderId={currentFolderId}
                onSelectFolder={navigateToFolder}
                onSelectFile={handleFileClick}
                onUpload={() => setShowUpload(true)}
                onNewFolder={() => setShowNewFolder(true)}
            />

            {/* ── Dialogs ───────────────────────────────────────────────── */}
            <UploadDialog open={showUpload} onOpenChange={setShowUpload} folderId={currentFolderId} />
            <NewFolderDialog open={showNewFolder} onOpenChange={setShowNewFolder} parentId={currentFolderId} />
            {renameTarget && (
                <RenameDialog
                    open
                    onOpenChange={(v) => { if (!v) setRenameTarget(null); }}
                    type={renameTarget.type}
                    id={renameTarget.id}
                    currentName={renameTarget.name}
                />
            )}
            <FilePreviewDialog
                file={previewFile}
                open={previewFile !== null}
                onOpenChange={(v) => { if (!v) setPreviewFile(null); }}
            />
        </div>
    );
}