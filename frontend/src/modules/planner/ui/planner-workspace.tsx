import { type MouseEvent as ReactMouseEvent, useEffect, useMemo, useState } from "react";
import { addDays, endOfWeek, format, parseISO, startOfWeek, subDays } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, LoaderCircleIcon, SparklesIcon } from "lucide-react";
import { useDeadlines } from "@/modules/deadlines/api/hooks";
import { useTasks } from "@/modules/organizer/api/hooks";
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group";
import { SETTING_GROUP } from "@/modules/settings/model/tabs.config";
import { useSubjects } from "@/modules/subjects/api/hooks";
import { getSchedulerConfig } from "@/modules/schedule/ui/schedule-calendar/schedule.utils";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/shadcn/ui/sheet";
import { ApiError } from "@/shared/types/api";
import { cn } from "@/shared/shadcn/lib/utils";
import {
    useApplyPlannerSuggestions,
    useCreatePlannerBlock,
    useDeletePlannerBlock,
    useGeneratePlannerSuggestions,
    useMovePlannerBlock,
    usePlannerBlockStatus,
    usePlannerDay,
    usePlannerWeek,
    useResizePlannerBlock,
    useUpdatePlannerBlock,
} from "../api/hooks";
import { buildHours, clampRange, formatMinutesLabel, gridHeight, heightFromMinutes, minutesFromIso, PLANNER_GRID_TOP, PLANNER_PX_PER_MIN, roundToStep, topFromMinutes, toIsoFromDateAndTime } from "../lib/planner-time";
import type { PlannerBlock, PlannerBlockPayload, PlannerTimelineBlockItem, PlannerTimelineItem, PlannerSuggestionBlock } from "../model/types";
import { PlannerBlockDialog } from "./planner-block-dialog";

type PlannerViewMode = "day" | "week";

type DraftSlot = {
    startAt: string;
    endAt: string;
};

type DragState = {
    block: PlannerTimelineBlockItem;
    mode: "move" | "resize";
    startY: number;
    previewStartMinutes: number;
    previewEndMinutes: number;
    originalStartMinutes: number;
    originalEndMinutes: number;
};

type PlannerMoveResizePayload = Pick<PlannerBlockPayload, "type" | "startAt" | "endAt" | "allowLessonConflict">;

function getAccent(item: PlannerTimelineItem) {
    if (item.kind === "lesson") return item.subject.color ?? "#2563eb";
    return item.color ?? item.subject?.color ?? "#0f766e";
}

function isPlannerBlock(item: PlannerTimelineItem): item is PlannerTimelineBlockItem {
    return item.kind === "planner_block";
}

function SummaryCards({ summary }: { summary: { plannedMinutes: number; completedMinutes: number; lessonMinutes: number; focusMinutes: number; freeMinutes: number; isOverloaded: boolean; conflictsCount: number } }) {
    const items = [
        { label: "Planned", value: `${Math.round(summary.plannedMinutes / 60)}h` },
        { label: "Completed", value: `${Math.round(summary.completedMinutes / 60)}h` },
        { label: "Lessons", value: `${Math.round(summary.lessonMinutes / 60)}h` },
        { label: "Focus", value: `${Math.round(summary.focusMinutes / 60)}h` },
        { label: "Free", value: `${Math.round(summary.freeMinutes / 60)}h` },
    ];

    return (
        <div className="grid gap-3 md:grid-cols-5">
            {items.map((item) => (
                <Card key={item.label} className="border-border/60 bg-card/80">
                    <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                    </CardContent>
                </Card>
            ))}
            <Card className={cn("border-border/60 md:col-span-5", summary.isOverloaded && "border-amber-500/50 bg-amber-500/5")}>
                <CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
                    <span className="text-muted-foreground">
                        {summary.isOverloaded ? "День перевантажений або містить конфлікти." : "План дня збалансований."}
                    </span>
                    <Badge variant={summary.isOverloaded ? "outline" : "secondary"}>
                        Conflicts: {summary.conflictsCount}
                    </Badge>
                </CardContent>
            </Card>
        </div>
    );
}

function WeekSummaryCards({
    summary,
}: {
    summary: {
        plannedMinutes: number;
        completedMinutes: number;
        lessonMinutes: number;
        focusMinutes: number;
        freeMinutes: number;
        overloadedDaysCount: number;
        conflictsCount: number;
    };
}) {
    const items = [
        { label: "Planned", value: `${Math.round(summary.plannedMinutes / 60)}h` },
        { label: "Completed", value: `${Math.round(summary.completedMinutes / 60)}h` },
        { label: "Lessons", value: `${Math.round(summary.lessonMinutes / 60)}h` },
        { label: "Focus", value: `${Math.round(summary.focusMinutes / 60)}h` },
        { label: "Free", value: `${Math.round(summary.freeMinutes / 60)}h` },
    ];

    return (
        <div className="grid gap-3 md:grid-cols-5">
            {items.map((item) => (
                <Card key={item.label} className="border-border/60 bg-card/80">
                    <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                    </CardContent>
                </Card>
            ))}
            <Card className={cn("border-border/60 md:col-span-5", summary.overloadedDaysCount > 0 && "border-amber-500/50 bg-amber-500/5")}>
                <CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
                    <span className="text-muted-foreground">
                        {summary.overloadedDaysCount > 0
                            ? `Overloaded days: ${summary.overloadedDaysCount}`
                            : "Week plan looks balanced."}
                    </span>
                    <Badge variant={summary.overloadedDaysCount > 0 ? "outline" : "secondary"}>
                        Conflicts: {summary.conflictsCount}
                    </Badge>
                </CardContent>
            </Card>
        </div>
    );
}

function SuggestionsSheet({
    open,
    onOpenChange,
    suggestion,
    isLoading,
    onGenerate,
    onApply,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suggestion: { summary: string; blocks: PlannerSuggestionBlock[] } | null;
    isLoading: boolean;
    onGenerate: () => void;
    onApply: (blocks: PlannerSuggestionBlock[]) => Promise<void>;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <SparklesIcon className="size-4 text-primary" />
                        AI suggestions
                    </SheetTitle>
                    <SheetDescription>
                        Сформуйте пропозиції на день і застосуйте ті блоки, які хочете взяти в план.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    <Button onClick={onGenerate} disabled={isLoading} className="w-full">
                        {isLoading && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                        Скласти план дня
                    </Button>

                    {suggestion && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Пропозиція</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">{suggestion.summary}</p>
                                <div className="space-y-3">
                                    {suggestion.blocks.map((block) => (
                                        <div key={`${block.title}-${block.startAt}`} className="rounded-xl border border-border/60 p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-foreground">{block.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(parseISO(block.startAt), "HH:mm")} - {format(parseISO(block.endAt), "HH:mm")}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">{block.type}</Badge>
                                            </div>
                                            <p className="mt-2 text-xs text-muted-foreground">{block.reason}</p>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full" disabled={suggestion.blocks.length === 0} onClick={() => void onApply(suggestion.blocks)}>
                                    Застосувати пропозицію
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function PlannerDayBoard({
    date,
    items,
    slotStart,
    slotEnd,
    onCreateSlot,
    onEditBlock,
    onMoveBlock,
    onResizeBlock,
    onStatusToggle,
}: {
    date: string;
    items: PlannerTimelineItem[];
    slotStart: number;
    slotEnd: number;
    onCreateSlot: (slot: DraftSlot) => void;
    onEditBlock: (block: PlannerBlock) => void;
    onMoveBlock: (block: PlannerTimelineBlockItem, startAt: string, endAt: string) => Promise<void>;
    onResizeBlock: (block: PlannerTimelineBlockItem, startAt: string, endAt: string) => Promise<void>;
    onStatusToggle: (block: PlannerTimelineBlockItem) => Promise<void>;
}) {
    const [dragState, setDragState] = useState<DragState | null>(null);
    const hours = useMemo(() => buildHours(slotStart, slotEnd), [slotEnd, slotStart]);
    const totalHeight = useMemo(() => gridHeight(slotStart, slotEnd), [slotEnd, slotStart]);

    useEffect(() => {
        if (!dragState) return;

        const activeDrag = dragState;

        function handleMove(event: MouseEvent) {
            const deltaMinutes = roundToStep((event.clientY - activeDrag.startY) / PLANNER_PX_PER_MIN, 15);

            if (activeDrag.mode === "move") {
                const next = clampRange(
                    activeDrag.originalStartMinutes + deltaMinutes,
                    activeDrag.originalEndMinutes + deltaMinutes,
                    slotStart,
                    slotEnd,
                );

                setDragState((current) => current ? {
                    ...current,
                    previewStartMinutes: next.startMinutes,
                    previewEndMinutes: next.endMinutes,
                } : current);
                return;
            }

            const nextEnd = Math.max(
                activeDrag.originalStartMinutes + 30,
                Math.min(slotEnd, activeDrag.originalEndMinutes + deltaMinutes),
            );

            setDragState((current) => current ? {
                ...current,
                previewStartMinutes: activeDrag.originalStartMinutes,
                previewEndMinutes: nextEnd,
            } : current);
        }

        function handleUp() {
            const nextStartAt = toIsoFromDateAndTime(date, formatMinutesLabel(activeDrag.previewStartMinutes));
            const nextEndAt = toIsoFromDateAndTime(date, formatMinutesLabel(activeDrag.previewEndMinutes));

            const action = activeDrag.mode === "move"
                ? onMoveBlock(activeDrag.block, nextStartAt, nextEndAt)
                : onResizeBlock(activeDrag.block, nextStartAt, nextEndAt);

            void action.finally(() => setDragState(null));
        }

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp, { once: true });

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [date, dragState, onMoveBlock, onResizeBlock, slotEnd, slotStart]);

    function handleGridDoubleClick(event: ReactMouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const offset = event.clientY - rect.top;
        const startMinutes = Math.max(slotStart, roundToStep(slotStart + Math.max(0, offset - PLANNER_GRID_TOP) / PLANNER_PX_PER_MIN, 30));
        const next = clampRange(startMinutes, startMinutes + 60, slotStart, slotEnd);

        onCreateSlot({
            startAt: toIsoFromDateAndTime(date, formatMinutesLabel(next.startMinutes)),
            endAt: toIsoFromDateAndTime(date, formatMinutesLabel(next.endMinutes)),
        });
    }

    return (
        <Card className="overflow-hidden border-border/60">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-base capitalize">
                    {format(parseISO(`${date}T00:00:00`), "EEEE, d MMMM", { locale: uk })}
                </CardTitle>
                <span className="text-xs text-muted-foreground">Double click on empty space to add a block</span>
            </CardHeader>
            <CardContent className="overflow-auto p-0">
                <div className="flex min-w-[720px]">
                    <div className="w-16 shrink-0 border-r border-border/60 bg-muted/20">
                        {hours.map((hour, index) => (
                            <div
                                key={hour}
                                className="relative border-b border-border/30 px-2 text-[11px] text-muted-foreground"
                                style={{ height: index === hours.length - 1 ? 0 : 60 * PLANNER_PX_PER_MIN }}
                            >
                                <span className="-translate-y-1/2 absolute top-0 right-2">{String(hour).padStart(2, "0")}:00</span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="relative flex-1 bg-background"
                        style={{ height: totalHeight }}
                        onDoubleClick={handleGridDoubleClick}
                    >
                        {hours.map((hour, index) => (
                            <div
                                key={hour}
                                className="absolute left-0 right-0 border-t border-border/35"
                                style={{ top: PLANNER_GRID_TOP + index * 60 * PLANNER_PX_PER_MIN }}
                            />
                        ))}

                        {items.map((item) => {
                            const startMinutes = minutesFromIso(item.startAt);
                            const endMinutes = minutesFromIso(item.endAt);
                            const accent = getAccent(item);
                            const isDragging = isPlannerBlock(item) && dragState?.block.id === item.id;
                            const visualStart = isDragging ? dragState.previewStartMinutes : startMinutes;
                            const visualEnd = isDragging ? dragState.previewEndMinutes : endMinutes;

                            return (
                                <div
                                    key={`${item.kind}-${item.id}`}
                                    className={cn(
                                        "absolute left-3 right-3 rounded-2xl border px-3 py-2 shadow-sm",
                                        item.kind === "lesson"
                                            ? "border-border/60 bg-slate-100/70"
                                            : "border-border/70 bg-background/95",
                                        isDragging && "opacity-80 ring-2 ring-primary/50",
                                    )}
                                    style={{
                                        top: topFromMinutes(visualStart, slotStart),
                                        height: heightFromMinutes(visualStart, visualEnd),
                                        borderLeftWidth: 4,
                                        borderLeftColor: accent,
                                    }}
                                    onMouseDown={isPlannerBlock(item) && item.status !== "completed" ? (event) => {
                                        if ((event.target as HTMLElement).dataset.resizeHandle === "true") return;
                                        setDragState({
                                            block: item,
                                            mode: "move",
                                            startY: event.clientY,
                                            previewStartMinutes: startMinutes,
                                            previewEndMinutes: endMinutes,
                                            originalStartMinutes: startMinutes,
                                            originalEndMinutes: endMinutes,
                                        });
                                    } : undefined}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {format(parseISO(item.startAt), "HH:mm")} - {format(parseISO(item.endAt), "HH:mm")}
                                            </p>
                                            <p className="truncate font-semibold text-foreground">{item.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {item.kind === "lesson"
                                                    ? item.location || "Readonly lesson slot"
                                                    : item.description || item.type}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge variant={item.kind === "lesson" ? "outline" : "secondary"}>
                                                {item.kind === "lesson" ? "Lesson" : item.status}
                                            </Badge>
                                            {isPlannerBlock(item) && (
                                                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => void onStatusToggle(item)}>
                                                    {item.status === "completed" ? "Reset" : "Done"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {isPlannerBlock(item) && (
                                        <>
                                            <button type="button" className="absolute inset-0" onDoubleClick={() => onEditBlock(item)} />
                                            <button
                                                type="button"
                                                data-resize-handle="true"
                                                className="absolute inset-x-4 bottom-1 h-2 cursor-ns-resize rounded-full bg-border/80"
                                                onMouseDown={(event) => {
                                                    event.stopPropagation();
                                                    setDragState({
                                                        block: item,
                                                        mode: "resize",
                                                        startY: event.clientY,
                                                        previewStartMinutes: startMinutes,
                                                        previewEndMinutes: endMinutes,
                                                        originalStartMinutes: startMinutes,
                                                        originalEndMinutes: endMinutes,
                                                    });
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function PlannerWeekBoard({
    days,
    onOpenDay,
}: {
    days: Array<{ date: string; timeline: PlannerTimelineItem[]; summary: { plannedMinutes: number; freeMinutes: number; isOverloaded: boolean } }>;
    onOpenDay: (date: string) => void;
}) {
    return (
        <div className="grid gap-3 lg:grid-cols-7">
            {days.map((day) => (
                <Card
                    key={day.date}
                    className={cn("cursor-pointer border-border/60 transition-colors hover:border-primary/40", day.summary.isOverloaded && "border-amber-500/50")}
                    onClick={() => onOpenDay(day.date)}
                >
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-sm capitalize">
                            {format(parseISO(`${day.date}T00:00:00`), "EEE d MMM", { locale: uk })}
                        </CardTitle>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{Math.round(day.summary.plannedMinutes / 60)}h planned</span>
                            <span>{Math.round(day.summary.freeMinutes / 60)}h free</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {day.timeline.slice(0, 4).map((item) => (
                            <div key={`${item.kind}-${item.id}`} className="rounded-lg border border-border/50 px-2 py-1.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate font-medium">{item.title}</span>
                                    <span className="text-muted-foreground">{format(parseISO(item.startAt), "HH:mm")}</span>
                                </div>
                            </div>
                        ))}
                        {day.timeline.length === 0 && (
                            <p className="text-xs text-muted-foreground">Вільний день</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function PlannerWorkspace() {
    const [viewMode, setViewMode] = useState<PlannerViewMode>("day");
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<PlannerBlock | null>(null);
    const [draftSlot, setDraftSlot] = useState<DraftSlot | null>(null);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [suggestionState, setSuggestionState] = useState<{ summary: string; blocks: PlannerSuggestionBlock[] } | null>(null);

    const selectedDate = format(anchorDate, "yyyy-MM-dd");
    const { data: schedulerSettings } = useSettingsGroup(SETTING_GROUP.SCHEDULER);
    const schedulerConfig = useMemo(() => getSchedulerConfig(schedulerSettings), [schedulerSettings]);
    const { data: dayView, isLoading: isLoadingDay } = usePlannerDay(selectedDate);
    const { data: weekView, isLoading: isLoadingWeek } = usePlannerWeek(selectedDate);
    const { data: subjects = [] } = useSubjects();
    const { data: tasks = [] } = useTasks();
    const { data: deadlines = [] } = useDeadlines();
    const createBlock = useCreatePlannerBlock();
    const updateBlock = useUpdatePlannerBlock();
    const deleteBlock = useDeletePlannerBlock();
    const moveBlock = useMovePlannerBlock();
    const resizeBlock = useResizePlannerBlock();
    const statusBlock = usePlannerBlockStatus();
    const generateSuggestions = useGeneratePlannerSuggestions();
    const applySuggestions = useApplyPlannerSuggestions();

    useEffect(() => {
        if (schedulerConfig.defaultView === "week" || schedulerConfig.defaultView === "day") {
            setViewMode(schedulerConfig.defaultView);
        }
    }, [schedulerConfig.defaultView]);

    async function withLessonRetry<T extends PlannerBlockPayload>(
        payload: T,
        runner: (nextPayload: T) => Promise<unknown>,
    ) {
        try {
            await runner(payload);
        } catch (error) {
            if (!(error instanceof ApiError) || !error.isValidation) throw error;

            const errors = error.body.errors as Record<string, unknown> | undefined;
            const lessonConflicts = errors?.lessonConflicts;

            if (!Array.isArray(lessonConflicts)) throw error;

            if (window.confirm("Блок конфліктує із заняттям. Створити або оновити його все одно?")) {
                await runner({
                    ...payload,
                    allowLessonConflict: true,
                });
                return;
            }

            throw error;
        }
    }

    async function handleSubmit(payload: PlannerBlockPayload, block?: PlannerBlock | null) {
        if (block) {
            await withLessonRetry(payload, (nextPayload) => updateBlock.mutateAsync({
                id: block.id,
                payload: nextPayload,
            }));
            return;
        }

        await withLessonRetry(payload, (nextPayload) => createBlock.mutateAsync(nextPayload));
    }

    async function handleDelete(block: PlannerBlock) {
        await deleteBlock.mutateAsync(block.id);
        setDialogOpen(false);
        setEditingBlock(null);
    }

    async function handleMove(block: PlannerTimelineBlockItem, startAt: string, endAt: string) {
        await withLessonRetry<PlannerMoveResizePayload>(
            { type: block.type, startAt, endAt },
            (payload) => moveBlock.mutateAsync({
                id: block.id,
                startAt: payload.startAt,
                endAt: payload.endAt,
                allowLessonConflict: payload.allowLessonConflict,
            }),
        );
    }

    async function handleResize(block: PlannerTimelineBlockItem, startAt: string, endAt: string) {
        await withLessonRetry<PlannerMoveResizePayload>(
            { type: block.type, startAt, endAt },
            (payload) => resizeBlock.mutateAsync({
                id: block.id,
                startAt: payload.startAt,
                endAt: payload.endAt,
                allowLessonConflict: payload.allowLessonConflict,
            }),
        );
    }

    async function handleStatusToggle(block: PlannerTimelineBlockItem) {
        await statusBlock.mutateAsync({
            id: block.id,
            payload: {
                status: block.status === "completed" ? "planned" : "completed",
                actualMinutes: block.actualMinutes ?? undefined,
            },
        });
    }

    async function handleGenerateSuggestions() {
        const suggestion = await generateSuggestions.mutateAsync({
            date: selectedDate,
            includeTasks: true,
            includeDeadlines: true,
            maxBlocks: 6,
        });

        setSuggestionState(suggestion);
    }

    async function handleApplySuggestions(blocks: PlannerSuggestionBlock[]) {
        await applySuggestions.mutateAsync(blocks);
        setSuggestionsOpen(false);
    }

    const openCreateDialog = (slot?: DraftSlot) => {
        setEditingBlock(null);
        setDraftSlot(slot ?? null);
        setDialogOpen(true);
    };

    const isLoading = viewMode === "day" ? isLoadingDay : isLoadingWeek;
    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-xl border border-border/70">
                        <Button variant="ghost" className="rounded-none border-r border-border/70" onClick={() => setAnchorDate((current) => viewMode === "day" ? subDays(current, 1) : subDays(current, 7))}>
                            <ChevronLeftIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" className="rounded-none border-r border-border/70" onClick={() => setAnchorDate(new Date())}>
                            Today
                        </Button>
                        <Button variant="ghost" className="rounded-none" onClick={() => setAnchorDate((current) => viewMode === "day" ? addDays(current, 1) : addDays(current, 7))}>
                            <ChevronRightIcon className="size-4" />
                        </Button>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {viewMode === "day"
                                ? format(anchorDate, "EEEE, d MMMM", { locale: uk })
                                : `${format(startOfWeek(anchorDate, { weekStartsOn: 1 }), "d MMM", { locale: uk })} - ${format(endOfWeek(anchorDate, { weekStartsOn: 1 }), "d MMM", { locale: uk })}`}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Planner збирає заняття, дедлайни, задачі й ручні блоки в один погодинний план.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-1">
                        <Button variant={viewMode === "day" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("day")}>Day</Button>
                        <Button variant={viewMode === "week" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("week")}>Week</Button>
                    </div>
                    <Button variant="outline" onClick={() => setSuggestionsOpen(true)}>
                        <SparklesIcon className="mr-2 size-4" />
                        Suggestions
                    </Button>
                    <Button onClick={() => openCreateDialog()}>
                        <CalendarDaysIcon className="mr-2 size-4" />
                        New block
                    </Button>
                </div>
            </div>

            {viewMode === "day" && dayView?.summary && <SummaryCards summary={dayView.summary} />}
            {viewMode === "week" && weekView?.summary && <WeekSummaryCards summary={weekView.summary} />}

            {isLoading ? (
                <Card>
                    <CardContent className="flex h-64 items-center justify-center">
                        <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            ) : viewMode === "day" && dayView ? (
                <PlannerDayBoard
                    date={dayView.date}
                    items={dayView.timeline}
                    slotStart={schedulerConfig.dayStartMin}
                    slotEnd={schedulerConfig.dayEndMin}
                    onCreateSlot={(slot) => openCreateDialog(slot)}
                    onEditBlock={(block) => {
                        setEditingBlock(block);
                        setDraftSlot(null);
                        setDialogOpen(true);
                    }}
                    onMoveBlock={handleMove}
                    onResizeBlock={handleResize}
                    onStatusToggle={handleStatusToggle}
                />
            ) : weekView ? (
                <PlannerWeekBoard
                    days={weekView.days}
                    onOpenDay={(date) => {
                        setAnchorDate(parseISO(`${date}T00:00:00`));
                        setViewMode("day");
                    }}
                />
            ) : null}

            <PlannerBlockDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                block={editingBlock}
                prefill={draftSlot}
                tasks={tasks.filter((task) => task.status !== "done" && task.status !== "cancelled")}
                deadlines={deadlines.filter((deadline) => deadline.status !== "completed" && deadline.status !== "cancelled")}
                subjects={subjects}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                isPending={
                    createBlock.isPending ||
                    updateBlock.isPending ||
                    deleteBlock.isPending ||
                    moveBlock.isPending ||
                    resizeBlock.isPending
                }
            />

            <SuggestionsSheet
                open={suggestionsOpen}
                onOpenChange={setSuggestionsOpen}
                suggestion={suggestionState}
                isLoading={generateSuggestions.isPending}
                onGenerate={handleGenerateSuggestions}
                onApply={handleApplySuggestions}
            />
        </div>
    );
}
