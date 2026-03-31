import { useState } from "react";
import { ArchiveIcon, MoreVerticalIcon, PencilIcon, PinIcon, TrashIcon } from "lucide-react";
import { useDeleteNote, useSetNoteArchived, useSetNotePinned } from "../api";
import { stripMarkdown } from "../lib/utils";
import type { Note } from "../model/types";
import { useSubjects } from "@/modules/subjects/api/hooks";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card } from "@/shared/shadcn/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/shadcn/ui/dropdown-menu";
import { NoteDialog } from "./note-dialog";

interface Props {
    note: Note;
    archivedMode?: boolean;
}

export function NoteCard({ note, archivedMode = false }: Props) {
    const { data: subjects = [] } = useSubjects();
    const { mutate: deleteNote } = useDeleteNote();
    const { mutate: setPinned } = useSetNotePinned();
    const { mutate: setArchived } = useSetNoteArchived();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const subjectName = note.subjectId
        ? subjects.find((subject) => subject.id === note.subjectId)?.name ?? null
        : null;

    return (
        <>
            <Card className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">{note.title}</h3>
                            {note.isPinned ? (
                                <Badge variant="secondary" className="gap-1">
                                    <PinIcon className="size-3" />
                                    Pin
                                </Badge>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {subjectName ? <span>{subjectName}</span> : <span>Без предмета</span>}
                            <span>•</span>
                            <span>{note.taskIds.length} пов’язаних задач</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <MoreVerticalIcon className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <PencilIcon className="mr-2 size-4" />
                                Редагувати
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPinned({ id: note.id, isPinned: !note.isPinned })}>
                                <PinIcon className="mr-2 size-4" />
                                {note.isPinned ? "Відкріпити" : "Закріпити"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setArchived({ id: note.id, archived: !archivedMode })}>
                                <ArchiveIcon className="mr-2 size-4" />
                                {archivedMode ? "Повернути в активні" : "Архівувати"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                onClick={() => {
                                    if (confirm("Видалити цю нотатку?")) {
                                        deleteNote(note.id);
                                    }
                                }}
                            >
                                <TrashIcon className="mr-2 size-4" />
                                Видалити
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {stripMarkdown(note.bodyMarkdown) || "Нотатка поки що без тексту."}
                </p>
            </Card>

            <NoteDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                note={note}
                archivedMode={archivedMode}
            />
        </>
    );
}
