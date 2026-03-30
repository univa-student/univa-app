import { ENDPOINTS } from "@/shared/api/endpoints";
import { apiFetch } from "@/shared/api/http";
import { ApiError } from "@/shared/types/api";
import type { User } from "../model/types";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 150;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

export async function confirmAuthenticatedUser(): Promise<User> {
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
            return await apiFetch<User>(ENDPOINTS.auth.me, {
                silent401: true,
            });
        } catch (error) {
            lastError = error;

            const isRetryableUnauthorized =
                error instanceof ApiError &&
                error.status === 401 &&
                attempt < MAX_ATTEMPTS - 1;

            if (!isRetryableUnauthorized) {
                throw error;
            }

            await sleep(RETRY_DELAY_MS);
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error("Failed to confirm authenticated session.");
}
