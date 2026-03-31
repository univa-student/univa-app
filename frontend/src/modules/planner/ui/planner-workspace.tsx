import { type MouseEvent as ReactMouseEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, differenceInCalendarDays, endOfWeek, format, parseISO, startOfWeek, subDays } from "date-fns";
import { uk } from "date-fns/locale";
import {
    AlertCircleIcon,
    BotIcon,
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Clock3Icon,
    ListChecksIcon,
    LoaderCircleIcon,
    PlusIcon,
} from "lucide-react";
import { useDeadlines } from "@/modules/deadlines/api/hooks";
import type { Deadline } from "@/modules/deadlines/model/types";
import { useTasks } from "@/modules/organizer/api/hooks";
import type { Task } from "@/modules/organizer/model/types";
import { getSchedulerConfig } from "@/modules/schedule/ui/schedule-calendar/schedule.utils";
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group";
import { SETTING_GROUP } from "@/modules/settings/model/tabs.config";
import { useSubjects } from "@/modules/subjects/api/hooks";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { ApiError } from "@/shared/types/api";
import { PageSidePanel } from "@/shared/ui/page-side-panel";
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
import {
    buildHours,
    clampRange,
    formatMinutesLabel,
    gridHeight,
    heightFromMinutes,
    isoToDateParts,
    minutesFromIso,
    PLANNER_GRID_TOP,
    PLANNER_PX_PER_MIN,
    roundToStep,
    topFromMinutes,
    toIsoFromDateAndTime,
} from "../lib/planner-time";
import type {
    PlannerBlock,
    PlannerBlockPayload,
    PlannerDaySummary,
    PlannerSuggestion,
    PlannerSuggestionBlock,
    PlannerTimelineBlockItem,
    PlannerTimelineItem,
} from "../model/types";
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

type WeekDayCard = {
    date: string;
    timeline: PlannerTimelineItem[];
    summary: PlannerDaySummary;
};

type StatusTone = "neutral" | "warning" | "danger";

const focusTypes = new Set(["focus", "task", "deadline"]);

function isPlannerBlock(item: PlannerTimelineItem): item is PlannerTimelineBlockItem {
    return item.kind === "planner_block";
}

function isOpenTask(task: Task) {
    return task.status !== "done" && task.status !== "cancelled";
}

function isActiveDeadline(deadline: Deadline) {
    return deadline.status !== "completed" && deadline.status !== "cancelled";
}

function getDateKey(value: string | null | undefined) {
    if (!value) return null;
    return isoToDateParts(value).date;
}

function compareByDueDate<T extends { dueAt?: string | null }>(left: T, right: T) {
    const leftValue = left.dueAt ?? "9999-12-31T23:59:59";
    const rightValue = right.dueAt ?? "9999-12-31T23:59:59";

    return leftValue.localeCompare(rightValue);
}

function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    if (hours === 0) return `${remainder} хв`;
    if (remainder === 0) return `${hours} год`;

    return `${hours} год ${remainder} хв`;
}

function getSuggestionKey(block: PlannerSuggestionBlock) {
    return `${block.title}-${block.startAt}-${block.endAt}`;
}

function getAccent(item: PlannerTimelineItem) {
    if (item.kind === "lesson") return item.subject.color ?? "#94a3b8";
    return item.color ?? item.subject?.color ?? "#0f766e";
}

function getBlockStatusLabel(status: PlannerTimelineBlockItem["status"]) {
    switch (status) {
    case "planned":
        return "Заплановано";
    case "in_progress":
        return "У процесі";
    case "completed":
        return "Завершено";
    case "skipped":
        return "Пропущено";
    case "canceled":
        return "Скасовано";
    default:
        return status;
    }
}

function getBlockTypeLabel(type: PlannerTimelineBlockItem["type"]) {
    switch (type) {
    case "manual":
        return "Ручний";
    case "task":
        return "Задача";
    case "deadline":
        return "Дедлайн";
    case "focus":
        return "Фокус";
    case "break":
        return "Перерва";
    case "lesson":
        return "Пара";
    default:
        return type;
    }
}

function getFocusStatus(
    summary: PlannerDaySummary,
    unplannedTasksCount: number,
    unplannedDeadlinesCount: number,
) {
    const details: string[] = [];
    let tone: StatusTone = "neutral";
    let title = "День виглядає керованим";

    if (summary.conflictsCount > 0) {
        tone = "danger";
        title = "Є конфлікти у плані";
        details.push(`${summary.conflictsCount} конфлікт(и) між блоками або парами`);
    }

    if (summary.freeMinutes < 90) {
        tone = tone === "danger" ? "danger" : "warning";
        title = tone === "danger" ? title : "День щільно заповнений";
        details.push(`Вільного часу лише ${formatDuration(summary.freeMinutes)}`);
    }

    if (unplannedDeadlinesCount > 0) {
        tone = "danger";
        title = "Є дедлайни без підготовки";
        details.push(`${unplannedDeadlinesCount} дедлайн(и) без планових блоків`);
    }

    if (unplannedTasksCount > 0) {
        tone = tone === "danger" ? "danger" : "warning";
        if (tone === "warning") {
            title = "Є незаплановані задачі";
        }

        details.push(`${unplannedTasksCount} задач(і) без слотів`);
    }

    if (details.length === 0) {
        details.push(`Вільно ${formatDuration(summary.freeMinutes)} для додаткових блоків`);
    }

    return { tone, title, details };
}

function getWeekStatus(days: WeekDayCard[], unplannedTasksCount: number, unplannedDeadlinesCount: number) {
    const overloadedDays = days.filter((day) => day.summary.isOverloaded).length;
    const conflictDays = days.filter((day) => day.summary.conflictsCount > 0).length;
    const details: string[] = [];
    let tone: StatusTone = "neutral";
    let title = "Тиждень виглядає рівномірно";

    if (overloadedDays > 0) {
        tone = "warning";
        title = "Тиждень потребує корекції";
        details.push(`${overloadedDays} дн. з перевантаженням`);
    }

    if (conflictDays > 0) {
        tone = "danger";
        title = "У тижні є конфлікти";
        details.push(`${conflictDays} дн. з конфліктами`);
    }

    if (unplannedDeadlinesCount > 0) {
        tone = "danger";
        details.push(`${unplannedDeadlinesCount} дедлайн(и) без слотів`);
    }

    if (unplannedTasksCount > 0) {
        tone = tone === "danger" ? "danger" : "warning";
        details.push(`${unplannedTasksCount} задач(і) без блоків`);
    }

    if (details.length === 0) {
        details.push("Усі активні задачі й дедлайни вже мають місце у плані");
    }

    return { tone, title, details };
}

function getStatusStyles(tone: StatusTone) {
    if (tone === "danger") {
        return "border-rose-200 bg-rose-50 text-rose-900";
    }

    if (tone === "warning") {
        return "border-amber-200 bg-amber-50 text-amber-900";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

function getWorkloadLabel(summary: PlannerDaySummary) {
    if (summary.conflictsCount > 0 || summary.freeMinutes < 90) {
        return "ризиковий";
    }

    if (summary.freeMinutes >= 240) {
        return "легкий";
    }

    return "робочий";
}

function getWeekQuickSlot(date: string, dayStartMin: number, dayEndMin: number): DraftSlot {
    const startMinutes = Math.min(Math.max(dayStartMin, 17 * 60), Math.max(dayStartMin, dayEndMin - 60));
    const endMinutes = Math.min(dayEndMin, startMinutes + 60);

    return {
        startAt: toIsoFromDateAndTime(date, formatMinutesLabel(startMinutes)),
        endAt: toIsoFromDateAndTime(date, formatMinutesLabel(endMinutes)),
    };
}

function SummaryStrip({
    items,
}: {
    items: Array<{ label: string; value: string; tone?: "default" | "accent" | "warning" }>;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <div
                    key={item.label}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                        item.tone === "accent" && "border-primary/20 bg-primary/5 text-primary",
                        item.tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
                        (!item.tone || item.tone === "default") && "border-border/60 bg-card text-foreground",
                    )}
                >
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

function FocusStatusBar({
    tone,
    title,
    details,
}: {
    tone: StatusTone;
    title: string;
    details: string[];
}) {
    return (
        <div className={cn("rounded-2xl border px-4 py-3", getStatusStyles(tone))}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{title}</span>
                <span className="text-sm opacity-80">{details.join(" • ")}</span>
            </div>
        </div>
    );
}

function PlannerSidebar({
    viewMode,
    selectedDate,
    unplannedTasks,
    unplannedDeadlines,
    suggestionState,
    selectedSuggestionKeys,
    onToggleSuggestion,
    onGenerateSuggestions,
    onApplySuggestions,
    onOpenCreate,
    isGeneratingSuggestions,
    isApplyingSuggestions,
}: {
    viewMode: PlannerViewMode;
    selectedDate: string;
    unplannedTasks: Task[];
    unplannedDeadlines: Deadline[];
    suggestionState: PlannerSuggestion | null;
    selectedSuggestionKeys: string[];
    onToggleSuggestion: (key: string) => void;
    onGenerateSuggestions: () => Promise<void>;
    onApplySuggestions: () => Promise<void>;
    onOpenCreate: () => void;
    isGeneratingSuggestions: boolean;
    isApplyingSuggestions: boolean;
}) {
    const selectedSuggestionsCount = selectedSuggestionKeys.length;

    return (
        <PageSidePanel>
            <div className="flex h-full flex-col border-r border-border/60 bg-card/80">
                <div className="border-b border-border/60 px-5 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock3Icon className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            Шар планування
                        </span>
                    </div>
                    <h1 className="mt-3 text-xl font-semibold tracking-tight">Планер</h1>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Календар показує заняття. Планер показує, коли ти реально працюєш і що ще лишилось без слотів.
                    </p>
                </div>

                <div className="space-y-3 border-b border-border/60 px-4 py-4">
                    <Button className="w-full justify-start gap-2 rounded-xl" onClick={onOpenCreate}>
                        <PlusIcon className="size-4" />
                        Створити блок
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl"
                        disabled={isGeneratingSuggestions}
                        onClick={() => void onGenerateSuggestions()}
                    >
                        {isGeneratingSuggestions ? (
                            <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : (
                            <ListChecksIcon className="size-4" />
                        )}
                        Зібрати чернетку дня
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        {viewMode === "day"
                            ? `Чернетка збирається для ${format(parseISO(`${selectedDate}T00:00:00`), "d MMMM", { locale: uk })}`
                            : "Чернетка збирається для вибраного дня тижня"}
                    </p>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    <Card className="border-border/60 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Потребує планування</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                                <span className="text-muted-foreground">Задачі без слотів</span>
                                <span className="font-semibold text-foreground">{unplannedTasks.length}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                                <span className="text-muted-foreground">Дедлайни без підготовки</span>
                                <span className="font-semibold text-foreground">{unplannedDeadlines.length}</span>
                            </div>

                            {(unplannedTasks.length > 0 || unplannedDeadlines.length > 0) ? (
                                <div className="space-y-2">
                                    {unplannedDeadlines.slice(0, 3).map((deadline) => (
                                        <div key={`deadline-${deadline.id}`} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                                            <div className="flex items-start gap-2">
                                                <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-rose-600" />
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-rose-950">{deadline.title}</p>
                                                    <p className="text-xs text-rose-700">
                                                        До {format(parseISO(deadline.dueAt), "d MMM, HH:mm", { locale: uk })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {unplannedTasks.slice(0, 3).map((task) => (
                                        <div key={`task-${task.id}`} className="rounded-xl border border-border/60 bg-background px-3 py-2">
                                            <p className="truncate font-medium text-foreground">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {task.dueAt
                                                    ? `Бажано закрити до ${format(parseISO(task.dueAt), "d MMM, HH:mm", { locale: uk })}`
                                                    : "Без дедлайну, але ще без місця у плані"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Усі відкриті задачі та дедлайни вже прив’язані до блоків у поточному діапазоні.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Чернетка дня</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!suggestionState && (
                                <p className="text-sm text-muted-foreground">
                                    Planner може автоматично розкласти задачі та дедлайни по вільних слотах без окремого правого sheet.
                                </p>
                            )}

                            {suggestionState && (
                                <>
                                    <p className="text-sm text-muted-foreground">{suggestionState.summary}</p>

                                    <div className="space-y-2">
                                        {suggestionState.blocks.map((block) => {
                                            const key = getSuggestionKey(block);
                                            const isSelected = selectedSuggestionKeys.includes(key);

                                            return (
                                                <label
                                                    key={key}
                                                    className={cn(
                                                        "flex cursor-pointer gap-3 rounded-xl border px-3 py-3 transition-colors",
                                                        isSelected ? "border-primary/30 bg-primary/5" : "border-border/60 bg-background",
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1"
                                                        checked={isSelected}
                                                        onChange={() => onToggleSuggestion(key)}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="truncate font-medium text-foreground">{block.title}</p>
                                                            <Badge variant="secondary">{getBlockTypeLabel(block.type)}</Badge>
                                                        </div>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {format(parseISO(block.startAt), "HH:mm")} - {format(parseISO(block.endAt), "HH:mm")}
                                                        </p>
                                                        <p className="mt-2 text-xs text-muted-foreground">{block.reason}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        className="w-full rounded-xl"
                                        disabled={selectedSuggestionsCount === 0 || isApplyingSuggestions}
                                        onClick={() => void onApplySuggestions()}
                                    >
                                        {isApplyingSuggestions && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                                        Застосувати {selectedSuggestionsCount > 0 ? `(${selectedSuggestionsCount})` : ""}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="border-t border-border/60 px-4 py-4">
                    <div className="rounded-2xl bg-muted/40 px-3 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <BotIcon className="size-4 text-primary" />
                            AI-помічник окремо
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Для повноцінних AI-сценаріїв, пояснень і роботи з контекстом використовуй окремий модуль.
                        </p>
                        <Link
                            to="/dashboard/ai"
                            className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-border/60 px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            Відкрити AI-помічник
                        </Link>
                    </div>
                </div>
            </div>
        </PageSidePanel>
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
            const didChange = activeDrag.previewStartMinutes !== activeDrag.originalStartMinutes
                || activeDrag.previewEndMinutes !== activeDrag.originalEndMinutes;

            if (!didChange) {
                setDragState(null);
                return;
            }

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
        <Card className="overflow-hidden border-border/60 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 py-3">
                <CardTitle className="text-base capitalize">
                    {format(parseISO(`${date}T00:00:00`), "EEEE, d MMMM", { locale: uk })}
                </CardTitle>
                <span className="text-xs text-muted-foreground">Подвійний клік по вільному слоту створює блок</span>
            </CardHeader>
            <CardContent className="overflow-auto p-0">
                <div className="flex min-w-[760px]">
                    <div className="w-16 shrink-0 border-r border-border/60 bg-muted/15">
                        {hours.map((hour, index) => (
                            <div
                                key={hour}
                                className="relative border-b border-border/25 px-2 text-[11px] text-muted-foreground"
                                style={{ height: index === hours.length - 1 ? 0 : 60 * PLANNER_PX_PER_MIN }}
                            >
                                <span className="absolute top-0 right-2 -translate-y-1/2">{String(hour).padStart(2, "0")}:00</span>
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
                                className="absolute left-0 right-0 border-t border-border/30"
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
                            const isFocusBlock = isPlannerBlock(item) && item.type === "focus";
                            const isDeadlineBlock = isPlannerBlock(item) && item.type === "deadline";
                            const isTaskBlock = isPlannerBlock(item) && item.type === "task";

                            return (
                                <div
                                    key={`${item.kind}-${item.id}`}
                                    className={cn(
                                        "absolute left-3 right-3 rounded-2xl border px-3 py-2 transition-shadow",
                                        item.kind === "lesson" && "border-border/40 bg-muted/30 text-muted-foreground shadow-none",
                                        item.kind === "planner_block" && "border-border/70 bg-background shadow-md",
                                        isFocusBlock && "border-emerald-200 bg-emerald-50 shadow-lg",
                                        isDeadlineBlock && "border-rose-200 bg-rose-50",
                                        isTaskBlock && "border-sky-200 bg-sky-50",
                                        isDragging && "opacity-80 ring-2 ring-primary/40",
                                    )}
                                    style={{
                                        top: topFromMinutes(visualStart, slotStart),
                                        height: heightFromMinutes(visualStart, visualEnd),
                                        borderLeftWidth: 4,
                                        borderLeftColor: accent,
                                    }}
                                    onDoubleClick={isPlannerBlock(item) ? () => onEditBlock(item) : undefined}
                                    onMouseDown={isPlannerBlock(item) && item.status !== "completed" ? (event) => {
                                        if ((event.target as HTMLElement).closest("[data-interactive='true']")) return;
                                        event.preventDefault();

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
                                            <p className={cn("text-xs font-medium", item.kind === "lesson" ? "text-muted-foreground" : "text-foreground/70")}>
                                                {format(parseISO(item.startAt), "HH:mm")} - {format(parseISO(item.endAt), "HH:mm")}
                                            </p>
                                            <p className="truncate font-semibold text-foreground">{item.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {item.kind === "lesson"
                                                    ? item.location || "Заняття з розкладу"
                                                    : item.description || getBlockTypeLabel(item.type)}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Badge variant={item.kind === "lesson" ? "outline" : "secondary"}>
                                                    {item.kind === "lesson" ? "Пара" : getBlockTypeLabel(item.type)}
                                                </Badge>
                                                {isPlannerBlock(item) && (
                                                    <Badge variant="outline">{getBlockStatusLabel(item.status)}</Badge>
                                                )}
                                                {isPlannerBlock(item) && item.createdByAi && (
                                                    <Badge variant="outline">Автоплан</Badge>
                                                )}
                                            </div>

                                            {isPlannerBlock(item) && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    data-interactive="true"
                                                    className="h-7 px-2 text-xs"
                                                    onMouseDown={(event) => event.stopPropagation()}
                                                    onClick={() => void onStatusToggle(item)}
                                                >
                                                    {item.status === "completed" ? "Повернути" : "Завершити"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {isPlannerBlock(item) && (
                                        <button
                                            type="button"
                                            data-interactive="true"
                                            data-resize-handle="true"
                                            className="absolute inset-x-4 bottom-1 h-2 cursor-ns-resize rounded-full bg-border/80"
                                            onMouseDown={(event) => {
                                                event.preventDefault();
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
    openTasks,
    activeDeadlines,
    linkedTaskIds,
    linkedDeadlineIds,
    onOpenDay,
    onQuickAdd,
}: {
    days: WeekDayCard[];
    openTasks: Task[];
    activeDeadlines: Deadline[];
    linkedTaskIds: Set<number>;
    linkedDeadlineIds: Set<number>;
    onOpenDay: (date: string) => void;
    onQuickAdd: (date: string) => void;
}) {
    return (
        <div className="grid gap-3 lg:grid-cols-7">
            {days.map((day) => {
                const plannerBlocks = day.timeline.filter(isPlannerBlock);
                const focusMinutes = plannerBlocks
                    .filter((item) => focusTypes.has(item.type) && item.status !== "canceled")
                    .reduce((total, item) => total + Math.max(0, minutesFromIso(item.endAt) - minutesFromIso(item.startAt)), 0);
                const lessonCount = day.timeline.filter((item) => item.kind === "lesson").length;
                const unplannedTasksCount = openTasks.filter((task) => getDateKey(task.dueAt) === day.date && !linkedTaskIds.has(task.id)).length;
                const urgentDeadlinesCount = activeDeadlines.filter((deadline) => getDateKey(deadline.dueAt) === day.date && !linkedDeadlineIds.has(deadline.id)).length;
                const workloadLabel = getWorkloadLabel(day.summary);

                return (
                    <Card
                        key={day.date}
                        className={cn(
                            "cursor-pointer border-border/60 shadow-none transition-colors hover:border-primary/40",
                            day.summary.isOverloaded && "border-amber-300 bg-amber-50/40",
                        )}
                        onClick={() => onOpenDay(day.date)}
                    >
                        <CardHeader className="space-y-3 pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle className="text-sm capitalize">
                                        {format(parseISO(`${day.date}T00:00:00`), "EEE d MMM", { locale: uk })}
                                    </CardTitle>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {workloadLabel === "ризиковий" ? "Потребує уваги" : workloadLabel === "легкий" ? "Є місце для нових блоків" : "Робочий день"}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onQuickAdd(day.date);
                                    }}
                                >
                                    <PlusIcon className="size-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="secondary">Вільно {formatDuration(day.summary.freeMinutes)}</Badge>
                                <Badge variant="outline">Фокус {formatDuration(focusMinutes)}</Badge>
                                <Badge variant="outline">Пари {lessonCount}</Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {plannerBlocks.length > 0 ? (
                                <div className="space-y-2">
                                    {plannerBlocks.slice(0, 3).map((item) => (
                                        <div key={`${item.kind}-${item.id}`} className="rounded-xl border border-border/50 bg-background px-2.5 py-2 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate font-medium text-foreground">{item.title}</span>
                                                <span className="text-muted-foreground">{format(parseISO(item.startAt), "HH:mm")}</span>
                                            </div>
                                            <p className="mt-1 text-[11px] text-muted-foreground">{getBlockTypeLabel(item.type)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Немає власних блоків. День поки тримається лише на розкладі або ще порожній.
                                </p>
                            )}

                            {(unplannedTasksCount > 0 || urgentDeadlinesCount > 0) && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                                    <div className="flex items-center gap-2 font-medium">
                                        <AlertCircleIcon className="size-3.5" />
                                        Є прогалини планування
                                    </div>
                                    <div className="mt-1 space-y-1 text-amber-900/90">
                                        {urgentDeadlinesCount > 0 && <p>{urgentDeadlinesCount} дедлайн(и) цього дня без підготовки</p>}
                                        {unplannedTasksCount > 0 && <p>{unplannedTasksCount} задач(і) цього дня без слотів</p>}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

export function PlannerWorkspace() {
    const [viewMode, setViewMode] = useState<PlannerViewMode>("day");
    const [isViewInitialized, setIsViewInitialized] = useState(false);
    const [anchorDate, setAnchorDate] = useState<Date>(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<PlannerBlock | null>(null);
    const [draftSlot, setDraftSlot] = useState<DraftSlot | null>(null);
    const [suggestionState, setSuggestionState] = useState<PlannerSuggestion | null>(null);
    const [selectedSuggestionKeys, setSelectedSuggestionKeys] = useState<string[]>([]);

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
        if (isViewInitialized) return;
        if (schedulerConfig.defaultView === "week" || schedulerConfig.defaultView === "day") {
            setViewMode(schedulerConfig.defaultView);
            setIsViewInitialized(true);
        }
    }, [isViewInitialized, schedulerConfig.defaultView]);

    useEffect(() => {
        if (!suggestionState) {
            setSelectedSuggestionKeys([]);
            return;
        }

        setSelectedSuggestionKeys(suggestionState.blocks.map(getSuggestionKey));
    }, [suggestionState]);

    const openTasks = useMemo(() => [...tasks].filter(isOpenTask).sort(compareByDueDate), [tasks]);
    const activeDeadlines = useMemo(() => [...deadlines].filter(isActiveDeadline).sort(compareByDueDate), [deadlines]);

    const visibleTimeline = useMemo(() => {
        if (viewMode === "day") {
            return dayView?.timeline ?? [];
        }

        return weekView?.days.flatMap((day) => day.timeline) ?? [];
    }, [dayView?.timeline, viewMode, weekView?.days]);

    const linkedTaskIds = useMemo(() => {
        const ids = new Set<number>();
        visibleTimeline.forEach((item) => {
            if (isPlannerBlock(item) && item.taskId !== null) {
                ids.add(item.taskId);
            }
        });
        return ids;
    }, [visibleTimeline]);

    const linkedDeadlineIds = useMemo(() => {
        const ids = new Set<number>();
        visibleTimeline.forEach((item) => {
            if (isPlannerBlock(item) && item.deadlineId !== null) {
                ids.add(item.deadlineId);
            }
        });
        return ids;
    }, [visibleTimeline]);

    const unplannedTasks = useMemo(() => openTasks.filter((task) => !linkedTaskIds.has(task.id)), [linkedTaskIds, openTasks]);
    const unplannedDeadlines = useMemo(
        () => activeDeadlines.filter((deadline) => {
            if (linkedDeadlineIds.has(deadline.id)) return false;
            const diffDays = differenceInCalendarDays(parseISO(deadline.dueAt), parseISO(`${selectedDate}T00:00:00`));
            return diffDays <= 7;
        }),
        [activeDeadlines, linkedDeadlineIds, selectedDate],
    );

    const dayStatus = useMemo(
        () => dayView ? getFocusStatus(dayView.summary, unplannedTasks.length, unplannedDeadlines.length) : null,
        [dayView, unplannedDeadlines.length, unplannedTasks.length],
    );

    const weekStatus = useMemo(
        () => weekView ? getWeekStatus(weekView.days, unplannedTasks.length, unplannedDeadlines.length) : null,
        [unplannedDeadlines.length, unplannedTasks.length, weekView],
    );

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

            if (window.confirm("Блок перетинається із заняттям. Зберегти його попри конфлікт?")) {
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

    async function handleApplySuggestions() {
        if (!suggestionState) return;

        const blocks = suggestionState.blocks.filter((block) => selectedSuggestionKeys.includes(getSuggestionKey(block)));
        if (blocks.length === 0) return;

        await applySuggestions.mutateAsync(blocks);
        setSuggestionState(null);
    }

    function openCreateDialog(slot?: DraftSlot) {
        setEditingBlock(null);
        setDraftSlot(slot ?? null);
        setDialogOpen(true);
    }

    function openWeekQuickAdd(date: string) {
        openCreateDialog(getWeekQuickSlot(date, schedulerConfig.dayStartMin, schedulerConfig.dayEndMin));
    }

    function toggleSuggestionSelection(key: string) {
        setSelectedSuggestionKeys((current) => current.includes(key)
            ? current.filter((item) => item !== key)
            : [...current, key]);
    }

    const isLoading = viewMode === "day" ? isLoadingDay : isLoadingWeek;
    const summaryItems = viewMode === "day" && dayView ? [
        { label: "Вільно", value: formatDuration(dayView.summary.freeMinutes), tone: dayView.summary.freeMinutes < 90 ? "warning" : "accent" },
        { label: "Фокус", value: formatDuration(dayView.summary.focusMinutes) },
        { label: "Заплановано", value: formatDuration(dayView.summary.plannedMinutes) },
        { label: "Уроки", value: formatDuration(dayView.summary.lessonMinutes) },
        { label: "Без слотів", value: `${unplannedTasks.length + unplannedDeadlines.length}` },
    ] as const : viewMode === "week" && weekView ? [
        { label: "Вільно", value: formatDuration(weekView.summary.freeMinutes), tone: "accent" },
        { label: "Фокус", value: formatDuration(weekView.summary.focusMinutes) },
        { label: "Заплановано", value: formatDuration(weekView.summary.plannedMinutes) },
        { label: "Перевантажено днів", value: `${weekView.summary.overloadedDaysCount}`, tone: weekView.summary.overloadedDaysCount > 0 ? "warning" : "default" },
        { label: "Без слотів", value: `${unplannedTasks.length + unplannedDeadlines.length}` },
    ] as const : [];

    return (
        <div className="flex h-full min-h-0">
            <PlannerSidebar
                viewMode={viewMode}
                selectedDate={selectedDate}
                unplannedTasks={unplannedTasks}
                unplannedDeadlines={unplannedDeadlines}
                suggestionState={suggestionState}
                selectedSuggestionKeys={selectedSuggestionKeys}
                onToggleSuggestion={toggleSuggestionSelection}
                onGenerateSuggestions={handleGenerateSuggestions}
                onApplySuggestions={handleApplySuggestions}
                onOpenCreate={() => openCreateDialog()}
                isGeneratingSuggestions={generateSuggestions.isPending}
                isApplyingSuggestions={applySuggestions.isPending}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-border/60 px-4 py-4 md:px-6 lg:px-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center overflow-hidden rounded-xl border border-border/70">
                                    <Button variant="ghost" className="rounded-none border-r border-border/70" onClick={() => setAnchorDate((current) => viewMode === "day" ? subDays(current, 1) : subDays(current, 7))}>
                                        <ChevronLeftIcon className="size-4" />
                                    </Button>
                                    <Button variant="ghost" className="rounded-none border-r border-border/70" onClick={() => setAnchorDate(new Date())}>
                                        Сьогодні
                                    </Button>
                                    <Button variant="ghost" className="rounded-none" onClick={() => setAnchorDate((current) => viewMode === "day" ? addDays(current, 1) : addDays(current, 7))}>
                                        <ChevronRightIcon className="size-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 p-1">
                                    <Button variant={viewMode === "day" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("day")}>День</Button>
                                    <Button variant={viewMode === "week" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("week")}>Тиждень</Button>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {viewMode === "day"
                                        ? format(anchorDate, "EEEE, d MMMM", { locale: uk })
                                        : `${format(startOfWeek(anchorDate, { weekStartsOn: 1 }), "d MMM", { locale: uk })} - ${format(endOfWeek(anchorDate, { weekStartsOn: 1 }), "d MMM", { locale: uk })}`}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {viewMode === "day"
                                        ? "Фокус на твоїх блоках, вільних вікнах і тому, що ще не має місця в плані."
                                        : "Огляд тижня для рішення, де саме розмістити підготовку, а не просто перегляд пар."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" onClick={() => openCreateDialog()}>
                                <CalendarDaysIcon className="mr-2 size-4" />
                                Новий блок
                            </Button>
                        </div>
                    </div>

                    {summaryItems.length > 0 && (
                        <div className="mt-4">
                            <SummaryStrip items={[...summaryItems]} />
                        </div>
                    )}

                    {viewMode === "day" && dayStatus && (
                        <div className="mt-3">
                            <FocusStatusBar tone={dayStatus.tone} title={dayStatus.title} details={dayStatus.details} />
                        </div>
                    )}

                    {viewMode === "week" && weekStatus && (
                        <div className="mt-3">
                            <FocusStatusBar tone={weekStatus.tone} title={weekStatus.title} details={weekStatus.details} />
                        </div>
                    )}
                </div>

                <div className="min-h-0 flex-1 overflow-auto px-4 py-4 md:px-6 lg:px-8">
                    {isLoading ? (
                        <Card className="shadow-none">
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
                            onCreateSlot={openCreateDialog}
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
                            openTasks={openTasks}
                            activeDeadlines={activeDeadlines}
                            linkedTaskIds={linkedTaskIds}
                            linkedDeadlineIds={linkedDeadlineIds}
                            onOpenDay={(date) => {
                                setAnchorDate(parseISO(`${date}T00:00:00`));
                                setViewMode("day");
                            }}
                            onQuickAdd={openWeekQuickAdd}
                        />
                    ) : null}
                </div>
            </div>

            <PlannerBlockDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                block={editingBlock}
                prefill={draftSlot}
                tasks={openTasks}
                deadlines={activeDeadlines}
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
        </div>
    );
}
