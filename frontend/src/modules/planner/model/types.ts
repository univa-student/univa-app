export type PlannerBlockType = "manual" | "task" | "deadline" | "lesson" | "focus" | "break";
export type PlannerBlockStatus = "planned" | "in_progress" | "completed" | "skipped" | "canceled";
export type PlannerEnergyLevel = "low" | "medium" | "high";

export interface PlannerBlock {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    type: PlannerBlockType;
    status: PlannerBlockStatus;
    startAt: string;
    endAt: string;
    date: string;
    isAllDay: boolean;
    isLocked: boolean;
    createdByAi: boolean;
    color: string | null;
    sourceType: "task" | "deadline" | "lesson" | "subject" | null;
    sourceId: number | null;
    subjectId: number | null;
    taskId: number | null;
    deadlineId: number | null;
    scheduleLessonId: number | null;
    priority: number | null;
    estimatedMinutes: number | null;
    actualMinutes: number | null;
    energyLevel: PlannerEnergyLevel | null;
    meta: Record<string, unknown> | null;
    subject?: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    task?: {
        id: number;
        title: string;
        status: string;
        priority: string;
    } | null;
    deadline?: {
        id: number;
        title: string;
        status: string;
        priority: string;
        dueAt: string | null;
    } | null;
}

export interface PlannerTimelineLessonItem {
    kind: "lesson";
    id: number;
    lessonId: number | null;
    title: string;
    startAt: string;
    endAt: string;
    readonly: true;
    source: string;
    subject: {
        id: number | null;
        name: string | null;
        color: string | null;
    };
    location: string | null;
    note: string | null;
}

export interface PlannerTimelineBlockItem extends PlannerBlock {
    kind: "planner_block";
}

export type PlannerTimelineItem = PlannerTimelineLessonItem | PlannerTimelineBlockItem;

export interface PlannerDaySummary {
    plannedMinutes: number;
    completedMinutes: number;
    lessonMinutes: number;
    focusMinutes: number;
    freeMinutes: number;
    isOverloaded: boolean;
    conflictsCount: number;
}

export interface PlannerDayView {
    date: string;
    timeline: PlannerTimelineItem[];
    summary: PlannerDaySummary;
}

export interface PlannerWeekView {
    weekStart: string;
    weekEnd: string;
    days: PlannerDayView[];
    summary: {
        plannedMinutes: number;
        completedMinutes: number;
        lessonMinutes: number;
        focusMinutes: number;
        freeMinutes: number;
        overloadedDaysCount: number;
        conflictsCount: number;
    };
}

export interface PlannerSuggestionBlock {
    title: string;
    description: string | null;
    type: PlannerBlockType;
    startAt: string;
    endAt: string;
    taskId: number | null;
    deadlineId: number | null;
    subjectId: number | null;
    estimatedMinutes: number | null;
    reason: string;
}

export interface PlannerSuggestion {
    date: string;
    summary: string;
    blocks: PlannerSuggestionBlock[];
}

export interface PlannerMutationMeta {
    conflicts?: Array<Record<string, unknown>>;
}

export interface PlannerMutationResult<T> {
    data: T;
    meta?: PlannerMutationMeta;
}

export interface PlannerBlockPayload {
    title?: string | null;
    description?: string | null;
    type: PlannerBlockType;
    startAt: string;
    endAt: string;
    status?: PlannerBlockStatus;
    isAllDay?: boolean;
    isLocked?: boolean;
    color?: string | null;
    subjectId?: number | null;
    taskId?: number | null;
    deadlineId?: number | null;
    scheduleLessonId?: number | null;
    priority?: number | null;
    energyLevel?: PlannerEnergyLevel | null;
    estimatedMinutes?: number | null;
    actualMinutes?: number | null;
    meta?: Record<string, unknown> | null;
    allowLessonConflict?: boolean;
}

export interface PlannerStatusPayload {
    status: PlannerBlockStatus;
    actualMinutes?: number | null;
}

export interface PlannerSuggestionsPayload {
    date: string;
    includeTasks?: boolean;
    includeDeadlines?: boolean;
    respectLockedBlocks?: boolean;
    maxBlocks?: number;
}
