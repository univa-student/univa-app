// ─── API Response contract (matches Laravel ApiResponse) ─────────────────────

/** Successful response from the API */
export interface ApiResponse<T = unknown> {
    status: number;
    message: string;
    data?: T;
    meta?: Record<string, unknown>;
}

/** Validation errors shape from Laravel (422) */
export type ValidationErrors = Record<string, string[]>;

/** Unified API error thrown by apiFetch */
export class ApiError extends Error {
    readonly status: number;
    readonly body: {
        message: string;
        errors?: ValidationErrors;
    };

    constructor(
        status: number,
        body: { message: string; errors?: ValidationErrors },
    ) {
        super(body.message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }

    get isValidation() { return this.status === 422; }
    get isUnauthorized() { return this.status === 401; }
    get isForbidden() { return this.status === 403; }
    get isServerError() { return this.status >= 500; }

    /** Get first error message for a specific field (convenience for forms) */
    fieldError(field: string): string | undefined {
        return this.body.errors?.[field]?.[0];
    }
}
