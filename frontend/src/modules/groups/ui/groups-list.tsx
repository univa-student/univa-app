import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightIcon, LinkIcon, PlusIcon, UsersIcon } from "lucide-react";

import { useCreateGroup, useGroups, useJoinGroup } from "@/modules/groups/api/hooks";
import type { CreateGroupPayload } from "@/modules/groups/model/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

const initialForm: CreateGroupPayload = {
    name: "",
    code: "",
    description: "",
    color: "#1d4ed8",
    institutionName: "",
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
            facultyName: form.facultyName?.trim() || undefined,
            specialtyName: form.specialtyName?.trim() || undefined,
            course: form.course || undefined,
            studyYear: form.studyYear || undefined,
        });

        setForm(initialForm);
        navigate(`/dashboard/groups/${group.id}`);
    }

    async function handleJoin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const membership = await joinGroup.mutateAsync({ identifier: joinIdentifier.trim() });
        setJoinIdentifier("");
        navigate(`/dashboard/groups/${membership.groupId}`);
    }

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Групи</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    Академічні workspace-и для спільного розкладу, предметів, дедлайнів, файлів і комунікації.
                </p>
            </header>

            <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Створити групу</CardTitle>
                        <CardDescription>
                            Стартовий профіль групи для навчального контексту, учасників і спільних модулів.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Назва</span>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="КН-21"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Код</span>
                                <input
                                    required
                                    value={form.code}
                                    onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm uppercase outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="KN-21"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Заклад</span>
                                <input
                                    value={form.institutionName ?? ""}
                                    onChange={(event) => setForm((current) => ({ ...current, institutionName: event.target.value }))}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="ЦДУ"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Спеціальність</span>
                                <input
                                    value={form.specialtyName ?? ""}
                                    onChange={(event) => setForm((current) => ({ ...current, specialtyName: event.target.value }))}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="Комп’ютерні науки"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Курс</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={form.course ?? ""}
                                    onChange={(event) => setForm((current) => ({ ...current, course: event.target.value ? Number(event.target.value) : undefined }))}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="3"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Рік вступу</span>
                                <input
                                    type="number"
                                    min={2000}
                                    max={2100}
                                    value={form.studyYear ?? ""}
                                    onChange={(event) => setForm((current) => ({ ...current, studyYear: event.target.value ? Number(event.target.value) : undefined }))}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="2023"
                                />
                            </label>

                            <label className="md:col-span-2 flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Опис</span>
                                <textarea
                                    value={form.description ?? ""}
                                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                    className="min-h-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="Коротка нотатка про навчальний контекст групи"
                                />
                            </label>

                            <div className="md:col-span-2 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3">
                                <label className="flex items-center gap-3 text-sm">
                                    <span className="font-medium text-foreground">Колір групи</span>
                                    <input
                                        type="color"
                                        value={form.color ?? "#1d4ed8"}
                                        onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                                        className="h-10 w-16 rounded-lg border border-border bg-background p-1"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={createGroup.isPending}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <PlusIcon className="size-4" />
                                    {createGroup.isPending ? "Створення..." : "Створити групу"}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Вступ за кодом або інвайтом</CardTitle>
                        <CardDescription>
                            Підтримується код запрошення, short code групи або invite token.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex h-full flex-col gap-4">
                        <form className="flex flex-col gap-3" onSubmit={handleJoin}>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-foreground">Ідентифікатор</span>
                                <input
                                    required
                                    value={joinIdentifier}
                                    onChange={(event) => setJoinIdentifier(event.target.value)}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                                    placeholder="Наприклад KN21ABCD або token"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={joinGroup.isPending}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <LinkIcon className="size-4" />
                                {joinGroup.isPending ? "Приєднання..." : "Приєднатися"}
                            </button>
                        </form>

                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <UsersIcon className="size-4" />
                                Мої групи
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Активних груп: <span className="font-semibold text-foreground">{groups.length}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <section className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Ваші групи</h2>
                    <p className="text-sm text-muted-foreground">
                        Швидкий доступ до академічних просторів, у яких ви вже є учасником.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index}>
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
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                            <UsersIcon className="size-10 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold text-foreground">Груп ще немає</h3>
                            <p className="max-w-md text-sm text-muted-foreground">
                                Створіть нову групу або приєднайтеся за інвайтом, щоб зібрати спільний розклад, файли та дедлайни.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {groups.map((group) => (
                            <Link key={group.id} to={`/dashboard/groups/${group.id}`} className="block">
                                <Card className="h-full transition hover:-translate-y-0.5 hover:ring-primary/20">
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
                                                <CardDescription>{group.code}</CardDescription>
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
                                            <span className="font-semibold text-foreground">{group.membersCount ?? 0}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
