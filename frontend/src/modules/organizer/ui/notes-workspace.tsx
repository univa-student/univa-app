import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useNotes } from "../api";
import { useSubjects } from "@/modules/subjects/api/hooks";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs";
import { NoteCard } from "./note-card";
import { NoteDialog } from "./note-dialog";

const selectClassName = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function NotesWorkspace() {
    const [activeTab, setActiveTab] = useState("active");
    const [search, setSearch] = useState("");
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data: subjects = [] } = useSubjects();
    const { data: activeNotes = [], isLoading: isActiveLoading } = useNotes({
        search,
        subjectId,
        archived: false,
    });
    const { data: archivedNotes = [], isLoading: isArchivedLoading } = useNotes({
        search,
        subjectId,
        archived: true,
    });

    const notes = activeTab === "active" ? activeNotes : archivedNotes;
    const isLoading = activeTab === "active" ? isActiveLoading : isArchivedLoading;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Нотатки</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Markdown-нотатки з optional subject-linking і простим зв’язком із To-do.
                    </p>
                </div>

                <Button className="w-full lg:w-auto" onClick={() => setIsCreateOpen(true)}>
                    <PlusIcon className="mr-2 size-4" />
                    Нова нотатка
                </Button>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-border/70 bg-card p-4 shadow-sm md:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-2">
                    <Label htmlFor="notes-search">Пошук</Label>
                    <Input
                        id="notes-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Назва або зміст нотатки"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes-subject">Предмет</Label>
                    <select
                        id="notes-subject"
                        className={selectClassName}
                        value={subjectId ?? ""}
                        onChange={(event) => setSubjectId(event.target.value ? Number(event.target.value) : null)}
                    >
                        <option value="">Усі</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="active">Активні ({activeNotes.length})</TabsTrigger>
                    <TabsTrigger value="archived">Архів ({archivedNotes.length})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    <div className="grid gap-4 xl:grid-cols-2">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-44 rounded-[24px]" />
                            ))
                        ) : notes.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 p-8 text-sm text-muted-foreground xl:col-span-2">
                                Тут ще немає нотаток. Створи першу, щоб мати окремий простір для планування й ідей.
                            </div>
                        ) : (
                            notes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    archivedMode={activeTab === "archived"}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <NoteDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
    );
}
