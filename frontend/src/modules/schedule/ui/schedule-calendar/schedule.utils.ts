import type { SettingItem } from "@/modules/settings/api/settings.api";
import { getSelectedValue } from "@/modules/settings/api/settings.api";
import type {
    ViewMode,
    WeekParityAnchor,
    SchedulerConfig,
} from "@/modules/schedule/model/types";
import { DEFAULT_SCHEDULER_CONFIG } from "@/modules/schedule/model/types";

// ── Constants ─────────────────────────────────────────────────

export const PX_PER_MIN = 2.2;
export const GRID_TOP_PADDING = 8;

export type { ViewMode, WeekParityAnchor, SchedulerConfig };
export { DEFAULT_SCHEDULER_CONFIG };

export const WEEKDAYS_SHORT_WORKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт"];
export const WEEKDAYS_SHORT_FULL = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

// ── Time helpers ──────────────────────────────────────────────

export function toMin(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m ?? 0);
}

export function fmtTime(t: string | null | undefined): string {
    if (!t) return "";
    const p = t.split(":");
    return `${p[0]}:${p[1]}`;
}

export function minToTop(min: number, slotStart: number): number {
    return GRID_TOP_PADDING + (min - slotStart) * PX_PER_MIN;
}

export function durationToPx(sm: number, em: number): number {
    return Math.max((em - sm) * PX_PER_MIN - 4, 44);
}

export function getGridHeight(slotStart: number, slotEnd: number): number {
    return GRID_TOP_PADDING + (slotEnd - slotStart) * PX_PER_MIN + 16;
}

export function getHours(slotStart: number, slotEnd: number): number[] {
    return Array.from(
        { length: Math.floor((slotEnd - slotStart) / 60) + 1 },
        (_, i) => slotStart / 60 + i,
    );
}

function clampDayRange(
    startMin: number,
    endMin: number,
): { start: number; end: number } {
    const start = Math.max(0, Math.min(startMin, 23 * 60));
    const end = Math.max(start + 60, Math.min(endMin, 24 * 60));
    return { start, end };
}

function parseReminderMinutes(value: string): number | null {
    if (value === "off") return null;
    if (value.endsWith("m")) {
        const n = Number(value.slice(0, -1));
        return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
}

function getSelectedSettingValue(
    settings: Map<string, SettingItem>,
    key: string,
): string {
    const setting = settings.get(key);
    if (!setting) return "";
    return getSelectedValue(setting);
}

export function getSchedulerConfig(
    settings: SettingItem[] | undefined,
): SchedulerConfig {
    const byKey = new Map((settings ?? []).map((s) => [s.key, s]));

    const defaultViewRaw = getSelectedSettingValue(byKey, "scheduler_default_view");
    const defaultView = ["semester", "month", "week", "day"].includes(defaultViewRaw)
        ? (defaultViewRaw as ViewMode)
        : DEFAULT_SCHEDULER_CONFIG.defaultView;

    const showWeekendsRaw = getSelectedSettingValue(byKey, "scheduler_show_weekends");
    const showWeekends = showWeekendsRaw === "1";

    const dayStartRaw = getSelectedSettingValue(byKey, "scheduler_day_start");
    const dayEndRaw = getSelectedSettingValue(byKey, "scheduler_day_end");
    const dayStartParsed = /^\d{2}:\d{2}$/.test(dayStartRaw) ? toMin(dayStartRaw) : DEFAULT_SCHEDULER_CONFIG.dayStartMin;
    const dayEndParsed = /^\d{2}:\d{2}$/.test(dayEndRaw) ? toMin(dayEndRaw) : DEFAULT_SCHEDULER_CONFIG.dayEndMin;
    const range = clampDayRange(dayStartParsed, dayEndParsed);

    const reminderRaw = getSelectedSettingValue(byKey, "scheduler_lesson_reminder");
    const lessonReminderMin = reminderRaw
        ? parseReminderMinutes(reminderRaw)
        : DEFAULT_SCHEDULER_CONFIG.lessonReminderMin;

    const parityRaw = getSelectedSettingValue(byKey, "scheduler_week_parity_anchor");
    const weekParityAnchor: WeekParityAnchor = parityRaw === "odd" ? "odd" : "even";

    return {
        defaultView,
        showWeekends,
        dayStartMin: range.start,
        dayEndMin: range.end,
        lessonReminderMin,
        weekParityAnchor,
    };
}