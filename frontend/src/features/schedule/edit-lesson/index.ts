/**
 * features/schedule/edit-lesson/index.ts
 *
 * "Edit Lesson" feature stub.
 */
// Exports EditLessonModal + useEditLesson hook when implemented.
export type EditLessonPayload = {
    id: number;
    subjectId?: number;
    dayOfWeek?: number;
    startsAt?: string;
    endsAt?: string;
    room?: string | null;
    lessonTypeId?: number;
};
