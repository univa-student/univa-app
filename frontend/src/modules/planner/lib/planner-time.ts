export const PLANNER_PX_PER_MIN = 1.6;
export const PLANNER_GRID_TOP = 8;

export function isoToDateParts(value: string) {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

    return {
        date: local.toISOString().slice(0, 10),
        time: local.toISOString().slice(11, 16),
    };
}

export function toIsoFromDateAndTime(date: string, time: string): string {
    return new Date(`${date}T${time}:00`).toISOString();
}

export function minutesFromIso(value: string): number {
    const date = new Date(value);
    return date.getHours() * 60 + date.getMinutes();
}

export function topFromMinutes(minutes: number, slotStart: number): number {
    return PLANNER_GRID_TOP + (minutes - slotStart) * PLANNER_PX_PER_MIN;
}

export function heightFromMinutes(startMinutes: number, endMinutes: number): number {
    return Math.max((endMinutes - startMinutes) * PLANNER_PX_PER_MIN - 4, 36);
}

export function buildHours(slotStart: number, slotEnd: number): number[] {
    return Array.from(
        { length: Math.floor((slotEnd - slotStart) / 60) + 1 },
        (_, index) => slotStart / 60 + index,
    );
}

export function gridHeight(slotStart: number, slotEnd: number): number {
    return PLANNER_GRID_TOP + (slotEnd - slotStart) * PLANNER_PX_PER_MIN + 24;
}

export function formatMinutesLabel(value: number): string {
    const hours = Math.floor(value / 60).toString().padStart(2, "0");
    const minutes = (value % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function clampRange(startMinutes: number, endMinutes: number, dayStart: number, dayEnd: number) {
    const duration = Math.max(30, endMinutes - startMinutes);
    let nextStart = Math.max(dayStart, startMinutes);
    let nextEnd = nextStart + duration;

    if (nextEnd > dayEnd) {
        nextEnd = dayEnd;
        nextStart = Math.max(dayStart, nextEnd - duration);
    }

    return {
        startMinutes: nextStart,
        endMinutes: nextEnd,
    };
}

export function roundToStep(minutes: number, step = 15) {
    return Math.round(minutes / step) * step;
}
