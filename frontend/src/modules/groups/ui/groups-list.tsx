import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRightIcon,
    LinkIcon, Loader2Icon,
    PlusIcon,
    UsersIcon,
} from "lucide-react";

import { useCreateGroup, useGroups, useJoinGroup } from "@/modules/groups/api/hooks";
import type { CreateGroupPayload } from "@/modules/groups/model/types";
import { GroupColorPicker } from "@/modules/groups/shared/group-color-picker";
import { GroupUniversityFields } from "@/modules/groups/shared/university-fields";
import { Field, groupTextAreaClassName } from "@/modules/groups/shared/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
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
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                Групи
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Каталог навчальних і спільних просторів. Створення та вступ виконуються через окремі дії.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => setIsJoinOpen(true)}>
                            <LinkIcon className="size-4" />
                            Вступити
                        </Button>

                        <Button onClick={() => setIsCreateOpen(true)}>
                            <PlusIcon className="size-4" />
                            Створити групу
                        </Button>
                    </div>
                </div>
            </section>


            <section className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">Ваші групи</h2>
                    <p className="text-sm text-muted-foreground">
                        Актуальний каталог груп, у яких ви вже є учасником.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="border-border/70">
                                <CardHeader>
                                    <Skeleton className="h-5 w-28 rounded-lg" />
                                    <Skeleton className="h-4 w-48 rounded-lg" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-4 w-full rounded-lg" />
                                    <Skeleton className="h-4 w-5/6 rounded-lg" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <Card className="border-border/70">
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <UsersIcon className="size-10 text-muted-foreground/50" />
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Груп ще немає
                                </h3>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Створіть нову групу або вступіть за інвайтом, щоб зібрати спільний простір для предметів, розкладу, дедлайнів і файлів.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {groups.map((group) => (
                            <Link key={group.id} to={`/dashboard/groups/${group.id}`} className="block">
                                <Card className="h-full border-border/70 transition hover:-translate-y-0.5 hover:border-primary/30">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    <span
                                                        className="inline-block size-3 rounded-full"
                                                        style={{ backgroundColor: group.color ?? "#2563eb" }}
                                                    />
                                                    {group.name}
                                                </CardTitle>
                                                <div className="text-sm text-muted-foreground">
                                                    {group.code}
                                                </div>
                                            </div>
                                            <ArrowRightIcon className="size-4 text-muted-foreground" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <p className="line-clamp-3 text-muted-foreground">
                                            {group.description || "Спільний академічний простір без опису."}
                                        </p>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {(group.institutionShortName || group.institutionName) && (
                                                <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/80">
                                                    {group.institutionShortName || group.institutionName}
                                                </span>
                                            )}
                                            {group.specialtyName && (
                                                <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/80">
                                                    {group.specialtyName}
                                                </span>
                                            )}
                                            {group.course && (
                                                <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/80">
                                                    {group.course} курс
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Учасники</span>
                                            <span className="font-semibold text-foreground">
                                                {group.membersCount ?? 0}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

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

                            {/* ── Left panel: Основне ─────────────────────────── */}
                            <div className="space-y-4 px-6 py-5 min-w-96">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Основне
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Назва">
                                        <Input
                                            required
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm((c) => ({ ...c, name: e.target.value }))
                                            }
                                            className="h-10 rounded-xl"
                                            placeholder="КН-21"
                                        />
                                    </Field>

                                    <Field label="Код">
                                        <Input
                                            required
                                            value={form.code}
                                            onChange={(e) =>
                                                setForm((c) => ({ ...c, code: e.target.value }))
                                            }
                                            className="h-10 rounded-xl uppercase"
                                            placeholder="KN-21"
                                        />
                                    </Field>
                                </div>

                                <Field label="Опис">
                        <textarea
                            value={form.description ?? ""}
                            onChange={(e) =>
                                setForm((c) => ({ ...c, description: e.target.value }))
                            }
                            className={groupTextAreaClassName}
                            placeholder="Короткий опис групи"
                        />
                                </Field>

                                <Field label="Колір групи">
                                    <GroupColorPicker
                                        value={form.color ?? "#2563eb"}
                                        onChange={(color) =>
                                            setForm((c) => ({ ...c, color }))
                                        }
                                    />
                                </Field>
                            </div>

                            {/* ── Right panel: Університет ─────────────────────── */}
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
                                            ...(patch.institutionName !== undefined && {
                                                institutionName: patch.institutionName,
                                            }),
                                            ...(patch.institutionShortName !== undefined && {
                                                institutionShortName: patch.institutionShortName,
                                            }),
                                            ...(patch.facultyName !== undefined && {
                                                facultyName: patch.facultyName,
                                            }),
                                            ...(patch.specialtyName !== undefined && {
                                                specialtyName: patch.specialtyName,
                                            }),
                                            ...(patch.course !== undefined && {
                                                course: patch.course ? Number(patch.course) : undefined,
                                            }),
                                            ...(patch.studyYear !== undefined && {
                                                studyYear: patch.studyYear
                                                    ? Number(patch.studyYear)
                                                    : undefined,
                                            }),
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="h-px w-full bg-border/70" />

                        <DialogFooter className="px-6 py-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Скасувати
                            </Button>

                            <Button type="submit" disabled={createGroup.isPending}>
                                {createGroup.isPending && (
                                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                                )}
                                Створити групу
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
                                Приєднатися
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
