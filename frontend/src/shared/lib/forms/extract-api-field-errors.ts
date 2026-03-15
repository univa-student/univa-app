import { ApiError } from "@/shared/types/api";

type ValidationErrors = Record<string, string[]>;

export function extractApiFieldErrors(error: unknown): Record<string, string> | null {
    if (!(error instanceof ApiError)) return null;
    if (!error.isValidation || !error.body.errors) return null;

    return Object.fromEntries(
        Object.entries(error.body.errors as ValidationErrors).map(([field, messages]) => [
            field,
            messages[0] ?? "Некоректне значення",
        ])
    );
}
