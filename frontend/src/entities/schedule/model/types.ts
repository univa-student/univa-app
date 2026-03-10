// ─── Dictionary types ─────────────────────────────────────────────────────────

export interface LessonType {
    id: number;
    code: string;
    name: string;
    color: string | null;
}

export interface DeliveryMode {
    id: number;
    code: string;
    name: string;
}

export interface ExamType {
    id: number;
    code: string;
    name: string;
}

export interface RecurrenceRule {
    id: number;
    code: "weekly" | "biweekly_even" | "biweekly_odd" | string;
    name: string;
    meta: Record<string, unknown> | null;
}

// ─── Subject ─────────────────────────────────────────────────────────────────

export interface Subject {
    id: number;
    name: string;
    teacherName: string | null;
    color: string | null;
}

// ─── Schedule lesson (rule) ───────────────────────────────────────────────────

export interface ScheduleLesson {
    id: number;
    subjectId: number;
    weekday: number; // 1 Mon … 7 Sun
    startsAt: string; // "HH:mm"
    endsAt: string;
    lessonTypeId: number;
    deliveryModeId: number;
    locationText: string | null;
    note: string | null;
    recurrenceRuleId: number;
    activeFrom: string; // "YYYY-MM-DD"
    activeTo: string | null;
    subject?: Subject;
    lessonType?: LessonType;
    deliveryMode?: DeliveryMode;
    recurrenceRule?: RecurrenceRule;
}

// ─── Built lesson instance (returned by GET /schedule) ───────────────────────

export type LessonSource = "rule" | "exception" | "exam";

export interface LessonInstance {
    id: number;
    lessonId: number | null;
    date: string; // "YYYY-MM-DD"
    startsAt: string; // "HH:mm" or "HH:mm:ss"
    endsAt: string | null;
    subject: {
        id: number;
        name: string;
        teacherName: string | null;
        color: string | null;
    };
    lessonType: {
        id: number;
        code: string;
        name: string;
        color: string | null;
    } | null;
    examType?: {
        id: number;
        code: string;
        name: string;
    };
    deliveryMode: {
        id: number;
        code: string;
        name: string;
    } | null;
    location: string | null;
    note: string | null;
    source: LessonSource;
}

// ─── Exception ────────────────────────────────────────────────────────────────

export type ExceptionAction = "cancelled" | "rescheduled" | "modified";

export interface ScheduleException {
    id: number;
    scheduleLessonId: number;
    date: string;
    action: ExceptionAction;
    overrideStartsAt: string | null;
    overrideEndsAt: string | null;
    overrideLocationText: string | null;
    overrideTeacher: string | null;
    overrideSubjectId: number | null;
    reason: string | null;
}

// ─── Exam Event ───────────────────────────────────────────────────────────────

export interface ExamEvent {
    id: number;
    subjectId: number;
    examTypeId: number;
    startsAt: string; // "YYYY-MM-DD HH:mm"
    endsAt: string | null;
    locationText: string | null;
    note: string | null;
    subject?: Subject;
    examType?: ExamType;
}

// ─── Form payloads ────────────────────────────────────────────────────────────

export interface CreateSubjectPayload {
    name: string;
    teacherName?: string | null;
    color?: string | null;
}

export interface CreateLessonPayload {
    subjectId: number;
    weekday: number;
    startsAt: string;
    endsAt: string;
    lessonTypeId: number;
    deliveryModeId: number;
    locationText?: string | null;
    note?: string | null;
    recurrenceRuleId: number;
    activeFrom: string;
    activeTo?: string | null;
}

export interface CreateExceptionPayload {
    date: string;
    action: ExceptionAction;
    overrideStartsAt?: string | null;
    overrideEndsAt?: string | null;
    overrideLocationText?: string | null;
    overrideTeacher?: string | null;
    overrideSubjectId?: number | null;
    reason?: string | null;
}

export interface CreateExamPayload {
    subjectId: number;
    examTypeId: number;
    startsAt: string;
    endsAt?: string | null;
    locationText?: string | null;
    note?: string | null;
}