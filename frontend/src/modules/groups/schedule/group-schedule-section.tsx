import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    addDays,
    endOfISOWeek,
    format,
    getISODay,
    isWithinInterval,
    startOfISOWeek,
    subDays,
} from "date-fns";
import {
    ArrowDownToLineIcon,
    CalendarPlusIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PencilIcon,
    Trash2Icon,
    XIcon,
} from "lucide-react";

import { useCreateGroupLesson } from "@/modules/groups/api/hooks";
import type { GroupScheduleItem, GroupSubject } from "@/modules/groups/model/types";
import {
    useDeliveryModes,
    useLessonTypes,
    useRecurrenceRules,
    useSchedule,
} from "@/modules/schedule/api/hooks";
import type { LessonInstance } from "@/modules/schedule/model/types";
import { ModeBadge } from "@/modules/schedule/ui/mode-badge";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";

import { GroupSelect } from "../shared/group-select";
import { EmptyState, Field, SectionHeader } from "../shared/ui";
import type { GroupRole } from "../shared/view";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface GroupScheduleSectionProps {
    groupId: number;
    items: GroupScheduleItem[];
    subjects: GroupSubject[];
    canManage: boolean;
    requiredRole: GroupRole;
    onEdit?: (item: GroupScheduleItem) => void;
    onDelete?: (item: GroupScheduleItem) => void;
}

const WEEKDAY_OPTIONS = [
    { value: "1", label: "Понеділок" },
    { value: "2", label: "Вівторок" },
    { value: "3", label: "Середа" },
    { value: "4", label: "Четвер" },
    { value: "5", label: "П'ятниця" },
    { value: "6", label: "Субота" },
    { value: "7", label: "Неділя" },
];

const INITIAL_FORM = {
    groupSubjectId: "",
    weekday: "1",
    startsAt: "08:30",
    endsAt: "10:05",
    lessonTypeId: "",
    deliveryModeId: "",
    recurrenceRuleId: "",
    locationText: "",
    note: "",
    activeFrom: format(new Date(), "yyyy-MM-dd"),
    activeTo: "",
};

// ---------------------------------------------------------------------------
// Import helpers
// ---------------------------------------------------------------------------

interface ImportCandidate {
    key: string;
    subjectId: number;
    subjectName: string;
    startsAt: string;
    endsAt: string;
    weekday: number;
    lessonTypeId: number;
    deliveryModeId: number;
    locationText: string;
    note: string;
    activeFrom: string;
    activeTo: string;
}

function buildImportCandidates(items: LessonInstance[]): ImportCandidate[] {
    const map = new Map<string, ImportCandidate>();

    for (const item of items) {
        if (!item.subject?.id || !item.lessonType?.id || !item.deliveryMode?.id || !item.endsAt) {
            continue;
        }

        const weekday = getISODay(new Date(item.date));
        const key =
            item.lessonId != null
                ? `lesson-${item.lessonId}`
                : [
                    item.subject.id,
                    weekday,
                    item.startsAt,
                    item.endsAt,
                    item.lessonType.id,
                    item.deliveryMode.id,
                    item.location ?? "",
                    item.note ?? "",
                ].join(":");

        const existing = map.get(key);

        if (!existing) {
            map.set(key, {
                key,
                subjectId: item.subject.id,
                subjectName: item.subject.name,
                startsAt: item.startsAt.slice(0, 5),
                endsAt: item.endsAt.slice(0, 5),
                weekday,
                lessonTypeId: item.lessonType.id,
                deliveryModeId: item.deliveryMode.id,
                locationText: item.location ?? "",
                note: item.note ?? "",
                activeFrom: item.date,
                activeTo: item.date,
            });
            continue;
        }

        if (item.date < existing.activeFrom) existing.activeFrom = item.date;
        if (item.date > existing.activeTo) existing.activeTo = item.date;
    }

    return Array.from(map.values()).sort((left, right) =>
        `${left.weekday}-${left.startsAt}`.localeCompare(`${right.weekday}-${right.startsAt}`),
    );
}

// ---------------------------------------------------------------------------
// Schedule deduplication & grouping
// ---------------------------------------------------------------------------

interface DeduplicatedLesson {
    key: string;
    /** Representative item (first instance, used for display) */
    item: GroupScheduleItem;
    /** All instances sorted by date – shown in the expandable grid */
    allItems: GroupScheduleItem[];
    activeFrom: string;
    activeTo: string;
    count: number;
    weekday: number;
}

function deduplicateLessons(items: GroupScheduleItem[]): DeduplicatedLesson[] {
    const map = new Map<string, DeduplicatedLesson>();

    for (const item of items) {
        const weekday = getISODay(new Date(item.date));
        const key =
            item.lessonId != null
                ? `lesson-${item.lessonId}`
                : [
                    item.subject.id,
                    weekday,
                    item.startsAt,
                    item.endsAt ?? "",
                    item.lessonType?.id ?? "",
                    item.deliveryMode?.id ?? "",
                    item.location ?? "",
                ].join(":");

        const existing = map.get(key);

        if (!existing) {
            map.set(key, {
                key,
                item,
                allItems: [item],
                activeFrom: item.date,
                activeTo: item.date,
                count: 1,
                weekday,
            });
        } else {
            existing.allItems.push(item);
            existing.count += 1;
            if (item.date < existing.activeFrom) existing.activeFrom = item.date;
            if (item.date > existing.activeTo) existing.activeTo = item.date;
        }
    }

    for (const entry of map.values()) {
        entry.allItems.sort((a, b) => a.date.localeCompare(b.date));
    }

    return Array.from(map.values());
}

function groupByWeekday(items: GroupScheduleItem[]): Map<number, DeduplicatedLesson[]> {
    const deduped = deduplicateLessons(items);
    const map = new Map<number, DeduplicatedLesson[]>();

    for (const entry of deduped) {
        const existing = map.get(entry.weekday);
        if (existing) {
            existing.push(entry);
        } else {
            map.set(entry.weekday, [entry]);
        }
    }

    for (const dayItems of map.values()) {
        dayItems.sort((a, b) => a.item.startsAt.localeCompare(b.item.startsAt));
    }

    return map;
}

function isCurrentWeek(dateStr: string): boolean {
    const now = new Date();
    return isWithinInterval(new Date(dateStr), {
        start: startOfISOWeek(now),
        end: endOfISOWeek(now),
    });
}

// ---------------------------------------------------------------------------
// LessonCard – single card with collapsible instances grid
// ---------------------------------------------------------------------------

function LessonCard({
                        entry,
                        canManage,
                        onEdit,
                        onDelete,
                    }: {
    entry: DeduplicatedLesson;
    canManage: boolean;
    onEdit?: (item: GroupScheduleItem) => void;
    onDelete?: (item: GroupScheduleItem) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const { key, item, activeFrom, activeTo, count, allItems } = entry;
    const isRecurring = count > 1;

    return (
        <Card key={key} className="overflow-hidden border-border/60 shadow-none">
            <CardContent className="p-0">
                {/* Main row */}
                <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <span
                            className="mt-1 size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.subject.color ?? "#2563eb" }}
                        />
                        <div className="min-w-0">
                            <div className="truncate font-semibold text-foreground">
                                {item.subject.name}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                                {item.startsAt.slice(0, 5)}
                                {item.endsAt ? ` – ${item.endsAt.slice(0, 5)}` : ""}
                                {" · "}
                                {activeFrom === activeTo
                                    ? activeFrom
                                    : `${activeFrom} – ${activeTo}`}
                            </div>
                            {(item.lessonType?.name || item.location || item.note) && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                                    {item.lessonType?.name && (
                                        <span className="rounded-md bg-muted px-1.5 py-0.5">
                                            {item.lessonType.name}
                                        </span>
                                    )}
                                    {item.location && (
                                        <span className="rounded-md bg-muted px-1.5 py-0.5">
                                            {item.location}
                                        </span>
                                    )}
                                    {item.note && (
                                        <span className="rounded-md bg-muted px-1.5 py-0.5 italic">
                                            {item.note}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {item.deliveryMode?.code && <ModeBadge code={item.deliveryMode.code} />}

                        {/* Expand trigger – only for recurring */}
                        {isRecurring && (
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                            >
                                {count}×
                                {expanded ? (
                                    <ChevronDownIcon className="size-3" />
                                ) : (
                                    <ChevronRightIcon className="size-3" />
                                )}
                            </button>
                        )}

                        {canManage && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => onEdit?.(item)}
                                >
                                    <PencilIcon className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onDelete?.(item)}
                                >
                                    <Trash2Icon className="size-3.5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Expandable instances grid */}
                {expanded && isRecurring && (
                    <div className="border-t border-border/50 bg-muted/30 px-4 py-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
                            {allItems.map((instance) => {
                                const thisWeek = isCurrentWeek(instance.date);
                                return (
                                    <div
                                        key={`${instance.id}-${instance.date}`}
                                        className={[
                                            "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs",
                                            thisWeek
                                                ? "bg-primary/10 font-medium text-primary"
                                                : "text-muted-foreground",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "size-1.5 shrink-0 rounded-full",
                                                thisWeek
                                                    ? "bg-primary"
                                                    : "bg-muted-foreground/40",
                                            ].join(" ")}
                                        />
                                        {instance.date}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// DayGroup – collapsible day accordion
// ---------------------------------------------------------------------------

interface DayGroupProps {
    weekday: number;
    entries: DeduplicatedLesson[];
    isToday: boolean;
    isCurrentWeek: boolean;
    canManage: boolean;
    defaultOpen: boolean;
    onEdit?: (item: GroupScheduleItem) => void;
    onDelete?: (item: GroupScheduleItem) => void;
}

function DayGroup({
                      weekday,
                      entries,
                      isToday,
                      isCurrentWeek: isThisWeek,
                      canManage,
                      defaultOpen,
                      onEdit,
                      onDelete,
                  }: DayGroupProps) {
    const [open, setOpen] = useState(defaultOpen);
    const label =
        WEEKDAY_OPTIONS.find((o) => o.value === weekday.toString())?.label ?? `День ${weekday}`;
    const count = entries.length;

    return (
        <div
            className={[
                "rounded-2xl border transition-colors",
                isToday
                    ? "border-primary/40 bg-primary/5"
                    : isThisWeek
                        ? "border-border/80 bg-muted/30"
                        : "border-border/50 bg-background",
            ].join(" ")}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
            >
                <div className="flex items-center gap-2.5">
                    {open ? (
                        <ChevronDownIcon className="size-4 text-muted-foreground" />
                    ) : (
                        <ChevronRightIcon className="size-4 text-muted-foreground" />
                    )}
                    <span
                        className={[
                            "text-sm font-semibold",
                            isToday ? "text-primary" : "text-foreground",
                        ].join(" ")}
                    >
                        {label}
                    </span>
                    {isToday && (
                        <Badge variant="default" className="h-5 px-1.5 text-[10px] font-semibold">
                            Сьогодні
                        </Badge>
                    )}
                    {isThisWeek && !isToday && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            Цей тиждень
                        </Badge>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "пара" : count < 5 ? "пари" : "пар"}
                </span>
            </button>

            {open && (
                <div className="space-y-2 px-4 pb-4">
                    {entries.map((entry) => (
                        <LessonCard
                            key={entry.key}
                            entry={entry}
                            canManage={canManage}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export function GroupScheduleSection({
                                         groupId,
                                         items,
                                         subjects,
                                         canManage,
                                         onEdit,
                                         onDelete,
                                     }: GroupScheduleSectionProps) {
    const createGroupLesson = useCreateGroupLesson();
    const { data: lessonTypes = [] } = useLessonTypes();
    const { data: deliveryModes = [] } = useDeliveryModes();
    const { data: recurrenceRules = [] } = useRecurrenceRules();

    const importFrom = format(subDays(new Date(), 14), "yyyy-MM-dd");
    const importTo = format(addDays(new Date(), 120), "yyyy-MM-dd");
    const { data: personalSchedule = [] } = useSchedule(importFrom, importTo);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [subjectMapping, setSubjectMapping] = useState<Record<number, string>>({});
    const [subjectFilter, setSubjectFilter] = useState<string>("");

    const weeklyRule = useMemo(
        () => recurrenceRules.find((r) => r.code === "weekly") ?? recurrenceRules[0] ?? null,
        [recurrenceRules],
    );

    const subjectOptions = useMemo(
        () =>
            subjects.map((s) => ({
                value: s.id.toString(),
                label: s.name,
                description: s.teacherName ?? undefined,
            })),
        [subjects],
    );

    const lessonTypeOptions = useMemo(
        () => lessonTypes.map((i) => ({ value: i.id.toString(), label: i.name })),
        [lessonTypes],
    );

    const deliveryModeOptions = useMemo(
        () => deliveryModes.map((i) => ({ value: i.id.toString(), label: i.name })),
        [deliveryModes],
    );

    const recurrenceOptions = useMemo(
        () => recurrenceRules.map((i) => ({ value: i.id.toString(), label: i.name })),
        [recurrenceRules],
    );

    const importCandidates = useMemo(
        () => buildImportCandidates(personalSchedule),
        [personalSchedule],
    );

    const filteredItems = useMemo(
        () =>
            subjectFilter
                ? items.filter((item) => item.subject.id.toString() === subjectFilter)
                : items,
        [items, subjectFilter],
    );

    const groupedByWeekday = useMemo(() => groupByWeekday(filteredItems), [filteredItems]);
    const sortedWeekdays = useMemo(
        () => Array.from(groupedByWeekday.keys()).sort((a, b) => a - b),
        [groupedByWeekday],
    );

    const todayWeekday = getISODay(new Date());

    useEffect(() => {
        if (!subjects.length) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubjectMapping((current) => {
            const next = { ...current };

            for (const candidate of importCandidates) {
                if (next[candidate.subjectId]) continue;

                const match = subjects.find(
                    (s) =>
                        s.name.trim().toLowerCase() === candidate.subjectName.trim().toLowerCase(),
                );

                if (match) next[candidate.subjectId] = match.id.toString();
            }

            return next;
        });
    }, [importCandidates, subjects]);

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await createGroupLesson.mutateAsync({
            groupId,
            payload: {
                groupSubjectId: Number(form.groupSubjectId),
                weekday: Number(form.weekday),
                startsAt: form.startsAt,
                endsAt: form.endsAt,
                lessonTypeId: Number(form.lessonTypeId),
                deliveryModeId: Number(form.deliveryModeId),
                recurrenceRuleId: Number(form.recurrenceRuleId),
                locationText: form.locationText.trim() || undefined,
                note: form.note.trim() || undefined,
                activeFrom: form.activeFrom,
                activeTo: form.activeTo || undefined,
            },
        });

        setForm({
            ...INITIAL_FORM,
            lessonTypeId: lessonTypes[0]?.id?.toString() ?? "",
            deliveryModeId: deliveryModes[0]?.id?.toString() ?? "",
            recurrenceRuleId: weeklyRule?.id?.toString() ?? "",
        });
        setIsCreateOpen(false);
    }

    async function handleImport() {
        if (!weeklyRule) return;

        for (const key of selectedKeys) {
            const candidate = importCandidates.find((c) => c.key === key);
            if (!candidate) continue;

            const mappedGroupSubjectId = Number(subjectMapping[candidate.subjectId]);
            if (!mappedGroupSubjectId) continue;

            await createGroupLesson.mutateAsync({
                groupId,
                payload: {
                    groupSubjectId: mappedGroupSubjectId,
                    weekday: candidate.weekday,
                    startsAt: candidate.startsAt,
                    endsAt: candidate.endsAt,
                    lessonTypeId: candidate.lessonTypeId,
                    deliveryModeId: candidate.deliveryModeId,
                    recurrenceRuleId: weeklyRule.id,
                    locationText: candidate.locationText || undefined,
                    note: candidate.note || undefined,
                    activeFrom: candidate.activeFrom,
                    activeTo: candidate.activeTo || undefined,
                },
            });
        }

        setSelectedKeys([]);
        setIsImportOpen(false);
    }

    return (
        <div>
            <SectionHeader
                eyebrow="Schedule"
                title="Розклад"
                actions={
                    canManage ? (
                        <>
                            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                                <ArrowDownToLineIcon className="size-4" />
                                Імпорт із мого розкладу
                            </Button>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <CalendarPlusIcon className="size-4" />
                                Додати пару
                            </Button>
                        </>
                    ) : null
                }
            />

            <div className="space-y-4 p-4 md:p-6">
                {/* Subject filter pills */}
                {items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSubjectFilter("")}
                            className={[
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                subjectFilter === ""
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                            ].join(" ")}
                        >
                            Всі
                        </button>
                        {subjects.map((subject) => (
                            <button
                                key={subject.id}
                                type="button"
                                onClick={() =>
                                    setSubjectFilter((current) =>
                                        current === subject.id.toString()
                                            ? ""
                                            : subject.id.toString(),
                                    )
                                }
                                className={[
                                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                    subjectFilter === subject.id.toString()
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                                ].join(" ")}
                            >
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: subject.color ?? "#2563eb" }}
                                />
                                {subject.name}
                            </button>
                        ))}
                        {subjectFilter && (
                            <button
                                type="button"
                                onClick={() => setSubjectFilter("")}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <XIcon className="size-3" />
                                Скинути
                            </button>
                        )}
                    </div>
                )}

                {/* Weekday groups */}
                {sortedWeekdays.length ? (
                    <div className="space-y-3">
                        {sortedWeekdays.map((weekday) => {
                            const entries = groupedByWeekday.get(weekday) ?? [];
                            const now = new Date();
                            const weekStart = startOfISOWeek(now);
                            const weekEnd = endOfISOWeek(now);
                            const dayHasCurrentWeek = entries.some(({ activeFrom, activeTo }) => {
                                return (
                                    new Date(activeFrom) <= weekEnd &&
                                    new Date(activeTo) >= weekStart
                                );
                            });

                            return (
                                <DayGroup
                                    key={weekday}
                                    weekday={weekday}
                                    entries={entries}
                                    isToday={weekday === todayWeekday && dayHasCurrentWeek}
                                    isCurrentWeek={dayHasCurrentWeek}
                                    canManage={canManage}
                                    defaultOpen={weekday === todayWeekday || dayHasCurrentWeek}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        title="Розклад ще не заповнений"
                        description="Додайте пару вручну або підтягніть існуючий персональний розклад через mapping предметів."
                    />
                )}
            </div>

            {/* Create dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Нова пара</DialogTitle>
                        <DialogDescription>
                            Створення пари винесене в окремий діалог, а сама секція лишається
                            списком розкладу.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
                        <Field label="Предмет">
                            <GroupSelect
                                value={form.groupSubjectId}
                                onChange={(value) =>
                                    setForm((c) => ({ ...c, groupSubjectId: value }))
                                }
                                options={subjectOptions}
                                placeholder="Оберіть предмет"
                            />
                        </Field>

                        <Field label="День тижня">
                            <GroupSelect
                                value={form.weekday}
                                onChange={(value) => setForm((c) => ({ ...c, weekday: value }))}
                                options={WEEKDAY_OPTIONS}
                            />
                        </Field>

                        <Field label="Початок">
                            <Input
                                type="time"
                                value={form.startsAt}
                                onChange={(e) =>
                                    setForm((c) => ({ ...c, startsAt: e.target.value }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Кінець">
                            <Input
                                type="time"
                                value={form.endsAt}
                                onChange={(e) =>
                                    setForm((c) => ({ ...c, endsAt: e.target.value }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Тип заняття">
                            <GroupSelect
                                value={form.lessonTypeId}
                                onChange={(value) =>
                                    setForm((c) => ({ ...c, lessonTypeId: value }))
                                }
                                options={lessonTypeOptions}
                                placeholder="Оберіть тип"
                            />
                        </Field>

                        <Field label="Формат">
                            <GroupSelect
                                value={form.deliveryModeId}
                                onChange={(value) =>
                                    setForm((c) => ({ ...c, deliveryModeId: value }))
                                }
                                options={deliveryModeOptions}
                                placeholder="Оберіть формат"
                            />
                        </Field>

                        <Field label="Повторення">
                            <GroupSelect
                                value={form.recurrenceRuleId}
                                onChange={(value) =>
                                    setForm((c) => ({ ...c, recurrenceRuleId: value }))
                                }
                                options={recurrenceOptions}
                                placeholder="Оберіть правило"
                            />
                        </Field>

                        <Field label="Аудиторія / локація">
                            <Input
                                value={form.locationText}
                                onChange={(e) =>
                                    setForm((c) => ({ ...c, locationText: e.target.value }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Активно з">
                            <Input
                                type="date"
                                value={form.activeFrom}
                                onChange={(e) =>
                                    setForm((c) => ({ ...c, activeFrom: e.target.value }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <Field label="Активно до">
                            <Input
                                type="date"
                                value={form.activeTo}
                                onChange={(e) =>
                                    setForm((c) => ({ ...c, activeTo: e.target.value }))
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <div className="md:col-span-2">
                            <Field label="Нотатка">
                                <Input
                                    value={form.note}
                                    onChange={(e) =>
                                        setForm((c) => ({ ...c, note: e.target.value }))
                                    }
                                    className="h-10 rounded-xl"
                                />
                            </Field>
                        </div>

                        <DialogFooter className="md:col-span-2">
                            <Button type="submit" disabled={createGroupLesson.isPending}>
                                Додати пару
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Імпорт розкладу</DialogTitle>
                        <DialogDescription>
                            Імпорт створює групові копії занять і вимагає мапінгу персональних
                            предметів на групові.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {importCandidates.length ? (
                            importCandidates.map((candidate) => {
                                const mappedValue = subjectMapping[candidate.subjectId] ?? "";
                                const selected = selectedKeys.includes(candidate.key);

                                return (
                                    <div
                                        key={candidate.key}
                                        className="rounded-2xl border border-border/70 p-4"
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <label className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={(e) =>
                                                        setSelectedKeys((current) =>
                                                            e.target.checked
                                                                ? [...current, candidate.key]
                                                                : current.filter(
                                                                    (k) => k !== candidate.key,
                                                                ),
                                                        )
                                                    }
                                                />
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {candidate.subjectName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {
                                                            WEEKDAY_OPTIONS.find(
                                                                (o) =>
                                                                    o.value ===
                                                                    candidate.weekday.toString(),
                                                            )?.label
                                                        }
                                                        {" · "}
                                                        {candidate.startsAt} – {candidate.endsAt}
                                                    </div>
                                                </div>
                                            </label>

                                            <div className="md:w-72">
                                                <GroupSelect
                                                    value={mappedValue}
                                                    onChange={(value) =>
                                                        setSubjectMapping((current) => ({
                                                            ...current,
                                                            [candidate.subjectId]: value,
                                                        }))
                                                    }
                                                    options={subjectOptions}
                                                    placeholder="Мапінг на груповий предмет"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState
                                title="Немає даних для імпорту"
                                description="Персональний розклад не містить занять у вибраному діапазоні або для імпорту бракує даних."
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleImport}
                            disabled={
                                !selectedKeys.length ||
                                !weeklyRule ||
                                selectedKeys.some((key) => {
                                    const candidate = importCandidates.find((c) => c.key === key);
                                    return !candidate || !subjectMapping[candidate.subjectId];
                                }) ||
                                createGroupLesson.isPending
                            }
                        >
                            Імпортувати заняття
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}