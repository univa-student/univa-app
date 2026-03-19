import { useRef, useState, useCallback, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/shadcn/ui/dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { UploadIcon, Trash2Icon } from "lucide-react";
import { useUploadFile, useCreateFolder } from "@/entities/file/api/hooks";
import { useSubjects } from "@/entities/schedule/api/hooks";

// ── Upload Dialog ─────────────────────────────────────────────

import type { FileItem } from "@/entities/file/model/types";

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    folderId?: number | null;
    subjectId?: number | null;
    onUploadSuccess?: (files: FileItem[]) => void;
}

export function UploadDialog({ open, onOpenChange, folderId, subjectId, onUploadSuccess }: UploadDialogProps) {
    const upload = useUploadFile();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        if (!open) {
            setSelectedFiles([]);
            setUploading(false);
        }
    }, [open]);

    // For subject selection if not provided
    const { data: subjects = [] } = useSubjects();
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(subjectId || null);

    useEffect(() => {
        if (subjectId !== undefined) {
            setSelectedSubjectId(subjectId || null);
        }
    }, [subjectId]);

    const handleFiles = useCallback((files: FileList | File[]) => {
        setSelectedFiles(prev => [...prev, ...Array.from(files)]);
    }, []);

    const removeFile = useCallback((index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = useCallback(async () => {
        if (selectedFiles.length === 0) return;
        setUploading(true);
        const uploadedItems: FileItem[] = [];
        for (const file of selectedFiles) {
            const fd = new FormData();
            fd.append("file", file);
            if (folderId) fd.append("folder_id", String(folderId));
            if (selectedSubjectId) fd.append("subject_id", String(selectedSubjectId));
            try {
                const res = await upload.mutateAsync(fd);
                if (res) uploadedItems.push(res);
            } catch { /* handled */ }
        }
        setUploading(false);
        setSelectedFiles([]);
        if (onUploadSuccess && uploadedItems.length > 0) {
            onUploadSuccess(uploadedItems);
        }
        onOpenChange(false);
    }, [selectedFiles, folderId, selectedSubjectId, upload, onOpenChange, onUploadSuccess]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Завантажити файли</DialogTitle>
                </DialogHeader>

                {subjectId === undefined && subjects.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                        <label className="text-[13px] font-medium text-foreground">Прив'язати до предмета (опційно)</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedSubjectId || ""}
                            onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Без предмета</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div
                    className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer mt-4
                        ${dragActive
                            ? "border-primary bg-primary/5 scale-[0.99]"
                            : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/3"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className={`flex size-14 items-center justify-center rounded-2xl transition-colors ${dragActive ? "bg-primary/15" : "bg-primary/10"}`}>
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

                {selectedFiles.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                        {selectedFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded-md border border-border/50 text-sm">
                                <span className="truncate flex-1 max-w-[200px] font-medium">{f.name}</span>
                                <span className="text-muted-foreground text-xs ml-4 mr-2">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeFile(i)}>
                                    <Trash2Icon className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter className="mt-4 sm:justify-between items-center gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading} className="w-full sm:w-auto">
                        Скасувати
                    </Button>
                    <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading} className="w-full sm:min-w-32">
                        {uploading ? "Завантаження..." : `Завантажити ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
                    </Button>
                </DialogFooter>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
            </DialogContent>
        </Dialog>
    );
}

// ── New Folder Dialog ─────────────────────────────────────────

interface NewFolderDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    parentId: number | null;
}

export function NewFolderDialog({ open, onOpenChange, parentId }: NewFolderDialogProps) {
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
                            <UploadIcon className="size-4" />
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
