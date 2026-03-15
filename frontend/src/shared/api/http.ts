import { API_BASE_URL } from "@/app/config/app.config";
import { ApiError } from "@/shared/types/api";
import { toast } from "@/shared/lib/toast-store";

type AlertVariant = "success" | "warning" | "destructive" | "info";

export interface ApiFetchOptions extends RequestInit {
    silent401?: boolean;
}

function triggerAlert(status: number, message?: string) {
    if (!message) return;

    let variant: AlertVariant = "info";

    if (status === 200 || status === 201) variant = "success";
    else if (status === 400 || status === 422) variant = "warning";
    else if (status >= 400) variant = "destructive";

    toast({ variant, message });
}

// ─── XSRF token reader ──────────────────────────────────────────────────────
function getXsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    if (!match) return null;

    return decodeURIComponent(match[1]);
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

/**
 * Universal API fetch wrapper.
 *
 * - Uses `credentials: "include"` for Sanctum cookie auth
 * - Automatically sends XSRF-TOKEN header
 * - Parses Laravel `ApiResponse` and returns `.data`
 * - Throws `ApiError` on non-2xx responses
 */
export async function apiFetch<T>(
    path: string,
    init: ApiFetchOptions = {},
): Promise<T> {
    const { silent401 = false, ...requestInit } = init;

    const xsrf = getXsrfToken();
    const requestBody = requestInit.body;
    const isFormData =
        typeof FormData !== "undefined" && requestBody instanceof FormData;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...requestInit,
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...(hasBody(requestInit) && !isFormData
                ? { "Content-Type": "application/json" }
                : {}),
            ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
            ...(requestInit.headers ?? {}),
        },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));

        const shouldSilence401 = silent401 && res.status === 401;

        if (!shouldSilence401 && typeof errorBody.message === "string") {
            triggerAlert(res.status, errorBody.message);
        }

        throw new ApiError(res.status, {
            message: errorBody.message ?? `HTTP ${res.status}`,
            errors: errorBody.errors,
        });
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const json = await res.json();

    if (json.message && typeof json.message === "string") {
        triggerAlert(res.status, json.message);
    }

    return (json.data !== undefined ? json.data : json) as T;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasBody(init?: RequestInit): boolean {
    if (!init) return false;
    if (init.body) return true;

    const method = (init.method ?? "GET").toUpperCase();

    return method === "POST" || method === "PUT" || method === "PATCH";
}
