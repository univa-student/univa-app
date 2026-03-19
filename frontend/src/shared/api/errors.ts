export type { ValidationErrors, ApiResponse } from "@/shared/types/api";
export { ApiError } from "@/shared/types/api";

import { ApiError } from "@/shared/types/api";

/**
 * Parse Laravel 422 validation errors into field → message map.
 */
export function parseValidationErrors(
    err: unknown,
): Record<string, string> {
    if (!(err instanceof ApiError)) return {};

    const errors = err.body?.errors;
    if (!errors) return {};

    return Object.fromEntries(
        Object.entries(errors).map(([field, msgs]) => [
            field,
            msgs?.[0] ?? "",
        ]),
    );
}

/**
 * Extract human-readable message from any error.
 */
export function getErrorMessage(
    err: unknown,
    fallback = "Щось пішло не так",
): string {
    if (err instanceof ApiError) {
        return err.body?.message ?? fallback;
    }

    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;

    return fallback;
}