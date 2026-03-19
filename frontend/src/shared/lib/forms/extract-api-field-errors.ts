import { ApiError } from "@/shared/types/api";

type ValidationErrors = Record<string, string[]>;

export function extractApiFieldErrors(
    error: unknown,
): Record<string, string> {
    if (!(error instanceof ApiError)) return {};
    if (!error.isValidation) return {};

    const errors = error.body?.errors;
    if (!errors) return {};

    return Object.fromEntries(
        Object.entries(errors as ValidationErrors).map(([field, messages]) => [
            field,
            messages?.[0] ?? "Некоректне значення",
        ])
    );
}