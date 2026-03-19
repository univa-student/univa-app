/**
 * shared/api/errors.ts
 *
 * Unified API error handling for Laravel responses.
 * Re-exports from shared/types/api.ts for backwards compatibility.
 */
export type { ValidationErrors, ApiResponse } from "@/shared/types/api";
export { ApiError } from "@/shared/types/api";

/**
 * Parse a Laravel 422 error response into a flat field→message record
 * for easy display in forms.
 */
export function parseValidationErrors(
    err: unknown,
): Record<string, string> {
    if (!(err instanceof Error && "body" in err)) return {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = (err as any).body?.errors as Record<string, string[]> | undefined;
    if (!errors) return {};

    return Object.fromEntries(
        Object.entries(errors).map(([field, msgs]) => [field, msgs[0] ?? ""]),
    );
}

/**
 * Returns a human-readable message from any thrown value. Falls back to
 * a generic string so components never see `undefined`.
 */
export function getErrorMessage(err: unknown, fallback = "Щось пішло не так"): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return fallback;
}
