import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LinkIcon,
    Loader2Icon,
    PlusIcon,
    UsersIcon,
} from "lucide-react";

import { useCreateGroup, useGroups, useJoinGroup } from "@/modules/groups/api/hooks";
import type { CreateGroupPayload } from "@/modules/groups/model/types";
import { GroupColorPicker } from "@/modules/groups/shared/group-color-picker";
import { GroupUniversityFields } from "@/modules/groups/shared/university-fields";
import { Field, groupTextAreaClassName } from "@/modules/groups/shared/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

const initialForm: CreateGroupPayload = {
    name: "",
    code: "",
    description: "",
    color: "#2563eb",
    institutionName: "",
    institutionShortName: "",
    facultyName: "",
    specialtyName: "",
    course: undefined,
    studyYear: undefined,
};

export function GroupsList() {
    const navigate = useNavigate();
    const { data: groups = [], isLoading } = useGroups();
    const createGroup = useCreateGroup();
    const joinGroup = useJoinGroup();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [form, setForm] = useState<CreateGroupPayload>(initialForm);
    const [joinIdentifier, setJoinIdentifier] = useState("");

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const group = await createGroup.mutateAsync({
            ...form,
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            description: form.description?.trim() || undefined,
            institutionName: form.institutionName?.trim() || undefined,
            institutionShortName: form.institutionShortName?.trim() || undefined,
            facultyName: form.facultyName?.trim() || undefined,
            specialtyName: form.specialtyName?.trim() || undefined,
            course: form.course || undefined,
            studyYear: form.studyYear || undefined,
        });

        setForm(initialForm);
        setIsCreateOpen(false);
        navigate(`/dashboard/groups/${group.id}`);
    }

    async function handleJoin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const membership = await joinGroup.mutateAsync({ identifier: joinIdentifier.trim() });
        setJoinIdentifier("");
        setIsJoinOpen(false);
        navigate(`/dashboard/groups/${membership.groupId}`);
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Групи</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Навчальні та спільні простори.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsJoinOpen(true)} className="rounded-xl">
                        <LinkIcon className="size-3.5" />
                        Вступити
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="rounded-xl">
                        <PlusIcon className="size-3.5" />
                        Створити
                    </Button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-2xl" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/50 bg-muted/10 py-16 text-center">
                    <UsersIcon className="size-9 text-muted-foreground/30" />
                    <div>
                        <p className="font-semibold">Груп ще немає</p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Створіть нову групу або вступіть за запрошенням.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsJoinOpen(true)} className="rounded-xl">
                            Вступити
                        </Button>
                        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="rounded-xl">
                            Створити
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {groups.map((group) => (
                        <Link
                            key={group.id}
                            to={`/dashboard/groups/${group.id}`}
                            className="group block"
                        >
                            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md">
                                {/* Color stripe */}
                                <div
                                    className="h-1 w-full"
                                    style={{ backgroundColor: group.color ?? "#2563eb" }}
                                />

                                <div className="flex flex-1 flex-col p-4">
                                    {/* Header */}
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{group.name}</p>
                                            <p className="text-[11px] text-muted-foreground">{group.code}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground tabular-nums">
                                            {group.membersCount ?? 0} уч.
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                        {group.description || "Спільний академічний простір."}
                                    </p>

                                    {/* Tags */}
                                    {(group.institutionShortName || group.institutionName || group.specialtyName || group.course) && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {(group.institutionShortName || group.institutionName) && (
                                                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                    {group.institutionShortName || group.institutionName}
                                                </span>
                                            )}
                                            {group.specialtyName && (
                                                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                    {group.specialtyName}
                                                </span>
                                            )}
                                            {group.course && (
                                                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                    {group.course} курс
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="overflow-hidden border-border/70 p-0 sm:max-w-8xl">
                    <DialogHeader className="px-6 pt-5">
                        <DialogTitle className="text-lg font-semibold tracking-tight">
                            Створити групу
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Налаштуйте основну інформацію та університетський контекст.
                        </p>
                    </DialogHeader>

                    <div className="h-px w-full bg-border/70" />

                    <form onSubmit={handleCreate}>
                        <div className="grid lg:grid-cols-[1fr_1fr]">
                            <div className="space-y-4 px-6 py-5 min-w-96">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Основне
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Назва">
                                        <Input
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                                            className="h-10 rounded-xl"
                                            placeholder="КН-21"
                                        />
                                    </Field>

                                    <Field label="Код">
                                        <Input
                                            required
                                            value={form.code}
                                            onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))}
                                            className="h-10 rounded-xl uppercase"
                                            placeholder="KN-21"
                                        />
                                    </Field>
                                </div>

                                <Field label="Опис">
                                    <textarea
                                        value={form.description ?? ""}
                                        onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                                        className={groupTextAreaClassName}
                                        placeholder="Короткий опис групи"
                                    />
                                </Field>

                                <Field label="Колір групи">
                                    <GroupColorPicker
                                        value={form.color ?? "#2563eb"}
                                        onChange={(color) => setForm((c) => ({ ...c, color }))}
                                    />
                                </Field>
                            </div>

                            <div className="space-y-4 border-t border-border/70 bg-muted/10 px-6 py-5 lg:border-l lg:border-t-0">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Університет
                                </p>

                                <GroupUniversityFields
                                    value={{
                                        institutionName: form.institutionName ?? "",
                                        institutionShortName: form.institutionShortName ?? "",
                                        facultyName: form.facultyName ?? "",
                                        specialtyName: form.specialtyName ?? "",
                                        course: form.course?.toString() ?? "",
                                        studyYear: form.studyYear?.toString() ?? "",
                                    }}
                                    onChange={(patch) =>
                                        setForm((c) => ({
                                            ...c,
                                            ...(patch.institutionName !== undefined && { institutionName: patch.institutionName }),
                                            ...(patch.institutionShortName !== undefined && { institutionShortName: patch.institutionShortName }),
                                            ...(patch.facultyName !== undefined && { facultyName: patch.facultyName }),
                                            ...(patch.specialtyName !== undefined && { specialtyName: patch.specialtyName }),
                                            ...(patch.course !== undefined && { course: patch.course ? Number(patch.course) : undefined }),
                                            ...(patch.studyYear !== undefined && { studyYear: patch.studyYear ? Number(patch.studyYear) : undefined }),
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="h-px w-full bg-border/70" />

                        <DialogFooter className="px-6 py-4">
                            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                                Скасувати
                            </Button>
                            <Button type="submit" disabled={createGroup.isPending}>
                                {createGroup.isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                                Створити групу
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Join dialog */}
            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Вступити в групу</DialogTitle>
                        <DialogDescription>
                            Вкажіть code групи, invite code або token.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleJoin}>
                        <Field label="Ідентифікатор">
                            <Input
                                required
                                value={joinIdentifier}
                                onChange={(event) => setJoinIdentifier(event.target.value)}
                                className="h-10 rounded-xl"
                                placeholder="Наприклад KN21ABCD або token"
                            />
                        </Field>

                        <DialogFooter>
                            <Button type="submit" disabled={joinGroup.isPending}>
                                {joinGroup.isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                                Приєднатися
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
