import { useState, useEffect } from "react";
import { format } from "date-fns";

import { useUpdateDeadline } from "@/modules/deadlines/api/hooks";
import type { Deadline, DeadlinePriority, DeadlineType, DeadlineStatus } from "@/modules/deadlines/model/types";
import { typeConfig } from "@/modules/deadlines/ui/deadline-type-icon";
import { priorityConfig } from "@/modules/deadlines/ui/deadline-priority-badge";

import { Button } from "@/shared/shadcn/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { UploadCloudIcon, XIcon, FileIcon } from "lucide-react";
import type { FileItem } from "@/modules/files/model/types";
import { UploadDialog } from "@/modules/files/ui/upload-file/upload-dialog";

interface Props {
    deadline: Deadline | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjects: { id: number; name: string }[];
}

export function EditDeadlineDialog({ deadline, open, onOpenChange, subjects }: Props) {
    const { mutateAsync: updateDeadline, isPending } = useUpdateDeadline();

    const [subjectId, setSubjectId] = useState<number>(0);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<DeadlineType>("homework");
    const [priority, setPriority] = useState<DeadlinePriority>("medium");
    const [status, setStatus] = useState<DeadlineStatus>("new");
    const [dueAt, setDueAt] = useState<string>("");
    const [dueTime, setDueTime] = useState<string>("23:59");
    const [attachedFiles, setAttachedFiles] = useState<FileItem[]>([]);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        if (deadline && open) {
            setSubjectId(deadline.subjectId);
            setTitle(deadline.title);
            setDescription(deadline.description || "");
            setType(deadline.type);
            setPriority(deadline.priority);
            setStatus(deadline.status);
            setDueAt(format(new Date(deadline.dueAt), "yyyy-MM-dd"));
            setDueTime(format(new Date(deadline.dueAt), "HH:mm"));
            setAttachedFiles(deadline.files || []);
        }
    }, [deadline, open]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!deadline || !title.trim() || !subjectId || !dueAt) return;

        const date = new Date(dueAt);
        const [hours, minutes] = dueTime.split(":").map(Number);
        date.setHours(hours ?? 23, minutes ?? 59, 59, 0);

        try {
            await updateDeadline({
                id: deadline.id,
                payload: {
                    subjectId: subjectId,
                    title: title.trim(),
                    description: description.trim() || null,
                    type,
                    priority,
                    status,
                    dueAt: date.toISOString(),
                    fileIds: attachedFiles.map(f => f.id),
                },
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update deadline", error);
        }
    };

    if (!deadline) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Редагувати дедлайн</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Назва</Label>
                        <Input
                            id="edit-title"
                            placeholder="Наприклад: Звіт з лаби №1"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-subject">Предмет</Label>
                        <select
                            id="edit-subject"
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                            value={subjectId}
                            onChange={e => setSubjectId(Number(e.target.value))}
                            required
                        >
                            <option value={0} disabled>Оберіть предмет</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Тип роботи</Label>
                            <select
                                id="edit-type"
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                                value={type}
                                onChange={e => setType(e.target.value as DeadlineType)}
                            >
                                {Object.entries(typeConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-priority">Пріоритет</Label>
                            <select
                                id="edit-priority"
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                                value={priority}
                                onChange={e => setPriority(e.target.value as DeadlinePriority)}
                            >
                                {Object.entries(priorityConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-due">Дата здачі</Label>
                            <Input
                                id="edit-due"
                                type="date"
                                value={dueAt}
                                onChange={e => setDueAt(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-time">Час</Label>
                            <Input
                                id="edit-time"
                                type="time"
                                value={dueTime}
                                onChange={e => setDueTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Статус</Label>
                            <select
                                id="edit-status"
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                                value={status}
                                onChange={e => setStatus(e.target.value as DeadlineStatus)}
                            >
                                <option value="new">Нове</option>
                                <option value="in_progress">В процесі</option>
                                <option value="completed">Виконано</option>
                                <option value="cancelled">Відмінено</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-desc">Опис (опціонально)</Label>
                        <textarea
                            id="edit-desc"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Деталі завдання..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Прикріплені файли</Label>
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowUpload(true)} className="h-7 text-xs gap-1.5" disabled={!subjectId}>
                                <UploadCloudIcon className="size-3.5" />
                                Додати файли
                            </Button>
                        </div>
                        {attachedFiles.length > 0 ? (
                            <div className="flex flex-col gap-1.5 mt-2">
                                {attachedFiles.map(file => (
                                    <div key={file.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md border border-border/50 text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileIcon className="size-4 text-muted-foreground shrink-0" />
                                            <span className="truncate flex-1 text-sm font-medium">{file.originalName}</span>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}>
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3 text-center">
                                Оберіть файли, щоб додати до дедлайну
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending || !title || !subjectId}>
                            {isPending ? "Збереження..." : "Зберегти зміни"}
                        </Button>
                    </div>
                </form>
            </DialogContent>

            <UploadDialog
                open={showUpload}
                onOpenChange={setShowUpload}
                subjectId={subjectId || undefined}
                folderId={null}
                onUploadSuccess={(files) => setAttachedFiles(prev => {
                    const existingIds = new Set(prev.map(f => f.id));
                    const newFiles = files.filter(f => !existingIds.has(f.id));
                    return [...prev, ...newFiles];
                })}
            />
        </Dialog>
    );
}
