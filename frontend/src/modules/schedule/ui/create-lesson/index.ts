/**
 * features/schedule/create-lesson/index.ts
 *
 * "Create Lesson" feature stub.
 * Exports the lesson creation form / mutation when implemented.
 */
// Placeholder — implement CreateLessonForm + useCreateLesson hook here.
export type CreateLessonPayload = {
    subjectId: number;
    dayOfWeek: number; // 0=Mon … 6=Sun
    startsAt: string; // "HH:mm"
    endsAt: string;
    room: string | null;
    lessonTypeId: number;
    recurrenceRuleId: number;
};
