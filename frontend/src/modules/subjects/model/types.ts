export interface Subject {
    id: number;
    name: string;
    teacherName: string | null;
    color: string | null;
    files_count?: number;
}

export interface CreateSubjectPayload {
    name: string;
    teacherName?: string | null;
    color?: string | null;
}
