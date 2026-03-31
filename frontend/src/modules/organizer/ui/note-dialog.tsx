import { type FormEvent, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LoaderCircleIcon, PinIcon } from "lucide-react";
import { useCreateNote, useSetNoteArchived, useUpdateNote, useTasks } from "../api";
import type { Note, NotePayload } from "../model/types";
import { stripMarkdown } from "../lib/utils";
import { useSubjects } from "@/modules/subjects/api/hooks";
import { Button } from "@/shared/shadcn/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs";
import { Textarea } from "@/shared/shadcn/ui/textarea";

const selectClassName = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    note?: Note | null;
    archivedMode?: boolean;
}

const emptyState: NotePayload = {
    title: "",
    bodyMarkdown: "",
    subjectId: null,
    taskIds: [],
};

export function NoteDialog({ open, onOpenChange, note, archivedMode = false }: Props) {
    const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();
    const { mutateAsync: updateNote, isPending: isUpdating } = useUpdateNote();
    const { mutateAsync: setArchived } = useSetNoteArchived();
    const { data: subjects = [] } = useSubjects();
    const { data: tasks = [] } = useTasks({ sortBy: "due_at", sortDir: "asc" });
    const [form, setForm] = useState<NotePayload>(emptyState);
    const [taskSearch, setTaskSearch] = useState("");
    const [mode, setMode] = useState("edit");

    useEffect(() => {
        if (!open) return;
        if (note) {
            setForm({
                title: note.title,
                bodyMarkdown: note.bodyMarkdown,
                subjectId: note.subjectId,
                taskIds: note.taskIds,
            });
            setMode("preview");
            return;
        }

        setForm(emptyState);
        setMode("edit");
    }, [note, open]);

    const isPending = isCreating || isUpdating;
    const filteredTasks = useMemo(() => {
        const query = taskSearch.trim().toLowerCase();
        if (!query) return tasks;
        return tasks.filter((task) => {
            const text = `${task.title} ${task.description ?? ""}`.toLowerCase();
            return text.includes(query);
        });
    }, [taskSearch, tasks]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload: NotePayload = {
            title: form.title.trim(),
            bodyMarkdown: form.bodyMarkdown,
            subjectId: form.subjectId,
            taskIds: form.taskIds,
        };

        if (!payload.title || !payload.bodyMarkdown.trim()) return;

        if (note) {
            await updateNote({
                id: note.id,
                payload,
            });

            if (archivedMode && note.archivedAt) {
                await setArchived({ id: note.id, archived: false });
            }
        } else {
            await createNote(payload);
        }

        onOpenChange(false);
    }

    function toggleTask(taskId: number) {
        setForm((current) => ({
            ...current,
            taskIds: current.taskIds.includes(taskId)
                ? current.taskIds.filter((id) => id !== taskId)
                : [...current.taskIds, taskId],
        }));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{note ? "Редагувати нотатку" : "Швидка нотатка"}</DialogTitle>
                    <DialogDescription>
                        Markdown для змісту, простий subject-linking і додаткове прив’язування до To-do задач.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="note-title">Назва</Label>
                                <Input
                                    id="note-title"
                                    value={form.title}
                                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                    placeholder="Наприклад, тези до підготовки"
                                    required
                                />
                            </div>

                            <Tabs value={mode} onValueChange={setMode}>
                                <TabsList>
                                    <TabsTrigger value="edit">Редагування</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                </TabsList>

                                <TabsContent value="edit" className="mt-3">
                                    <Textarea
                                        value={form.bodyMarkdown}
                                        onChange={(event) => setForm((current) => ({ ...current, bodyMarkdown: event.target.value }))}
                                        placeholder="## План&#10;&#10;- зібрати контекст&#10;- визначити наступні кроки"
                                        className="min-h-80"
                                    />
                                </TabsContent>

                                <TabsContent value="preview" className="mt-3">
                                    <div className="min-h-80 rounded-[24px] border border-border/70 bg-muted/20 p-5 prose prose-sm max-w-none">
                                        {form.bodyMarkdown.trim() ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {form.bodyMarkdown}
                                            </ReactMarkdown>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Нотатка ще порожня. Додай markdown, щоб побачити preview.
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2 rounded-[24px] border border-border/70 bg-card p-4">
                                <Label htmlFor="note-subject">Предмет</Label>
                                <select
                                    id="note-subject"
                                    className={selectClassName}
                                    value={form.subjectId ?? ""}
                                    onChange={(event) => setForm((current) => ({
                                        ...current,
                                        subjectId: event.target.value ? Number(event.target.value) : null,
                                    }))}
                                >
                                    <option value="">Без прив’язки</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3 rounded-[24px] border border-border/70 bg-card p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold">Пов’язані задачі</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Secondary feature: прив’язуй тільки коли це реально допомагає.
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                        <PinIcon className="size-3" />
                                        {form.taskIds.length}
                                    </div>
                                </div>

                                <Input
                                    value={taskSearch}
                                    onChange={(event) => setTaskSearch(event.target.value)}
                                    placeholder="Пошук по задачах"
                                />

                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {filteredTasks.length === 0 ? (
                                        <p className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                                            Поки нема задач під цей пошук.
                                        </p>
                                    ) : (
                                        filteredTasks.map((task) => {
                                            const checked = form.taskIds.includes(task.id);
                                            return (
                                                <label
                                                    key={task.id}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                                                        checked ? "border-primary/40 bg-primary/5" : "border-border/70 bg-background"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1"
                                                        checked={checked}
                                                        onChange={() => toggleTask(task.id)}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{task.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {stripMarkdown(task.description ?? "") || "Без опису"}
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                            {note ? "Зберегти" : "Створити"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
