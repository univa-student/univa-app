import type { ApiError, ValidationErrors } from "@/shared/types/api";

/** Get first validation error message for a specific field (422 Laravel errors) */
export function getFieldError(error: unknown, field: string): string | undefined {
    const apiError = toApiError(error);
    return apiError?.fieldError(field);
}

/** Get all validation errors as a flat record of `field -> message` */
export function getAllFieldErrors(error: unknown): Record<string, string> {
    const apiError = toApiError(error);
    if (!apiError || !apiError.body.errors) return {};

    return flattenValidationErrors(apiError.body.errors);
}

/** True if error is Laravel validation error (422) */
export function isValidationError(error: unknown): error is ApiError {
    const apiError = toApiError(error);
    return Boolean(apiError?.isValidation);
}

/** True if error is unauthorized (401) */
export function isUnauthorizedError(error: unknown): error is ApiError {
    const apiError = toApiError(error);
    return Boolean(apiError?.isUnauthorized);
}

/** True if error is forbidden (403) */
export function isForbiddenError(error: unknown): error is ApiError {
    const apiError = toApiError(error);
    return Boolean(apiError?.isForbidden);
}

/** True if error is 5xx */
export function isServerError(error: unknown): error is ApiError {
    const apiError = toApiError(error);
    return Boolean(apiError?.isServerError);
}

/** Safely cast unknown error to ApiError (if possible) */
export function toApiError(error: unknown): ApiError | null {
    if (!error || typeof error !== "object") return null;
    if (!("name" in error) || (error as any).name !== "ApiError") return null;
    return error as ApiError;
}

function flattenValidationErrors(errors: ValidationErrors): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [field, messages] of Object.entries(errors)) {
        if (!messages?.length) continue;
        result[field] = messages[0];
    }

    return result;
}

