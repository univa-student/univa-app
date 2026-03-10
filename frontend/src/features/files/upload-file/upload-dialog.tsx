import { useRef, useState, useCallback } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/shared/shadcn/ui/dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { UploadIcon } from "lucide-react";
import { useUploadFile, useCreateFolder } from "@/entities/file/api/hooks";

// ── Upload Dialog ─────────────────────────────────────────────

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    folderId: number | null;
}

export function UploadDialog({ open, onOpenChange, folderId }: UploadDialogProps) {
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
