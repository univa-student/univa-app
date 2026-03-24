import { API_BASE_URL } from "@/app/config/app.config";
import { ApiError } from "@/shared/types/api";
import { toast } from "@/shared/lib/toast-store";
import { fetchCsrfToken } from "./csrf";

type AlertVariant = "success" | "warning" | "destructive" | "info";

export interface ApiFetchOptions extends RequestInit {
    silent401?: boolean;
    skipCsrf?: boolean;
}

function triggerAlert(status: number, message?: string) {
    if (!message) return;

    let variant: AlertVariant = "info";

    if (status === 200 || status === 201) variant = "success";
    else if (status === 400 || status === 422) variant = "warning";
    else if (status >= 400) variant = "destructive";

    toast({ variant, message });
}

// ─── XSRF token reader ───────────────────────────────────
function getXsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

// ─── Core fetch ──────────────────────────────────────────
export async function apiFetch<T>(
    path: string,
    init: ApiFetchOptions = {},
): Promise<T> {
    const { silent401 = false, skipCsrf = false, ...requestInit } = init;

    const method = (requestInit.method ?? "GET").toUpperCase();

    // 🔥 авто-CSRF для mutation
    if (!skipCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await fetchCsrfToken();
    }

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

    // читаємо body 1 раз
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const shouldSilence401 = silent401 && res.status === 401;

        if (!shouldSilence401 && typeof json.message === "string") {
            triggerAlert(res.status, json.message);
        }

        throw new ApiError(res.status, {
            message: json.message ?? `HTTP ${res.status}`,
            errors: json.errors,
        });
    }

    if (res.status === 204) {
        return undefined as T;
    }

    if (typeof json.message === "string") {
        triggerAlert(res.status, json.message);
    }

    if (json.data !== undefined && json.meta !== undefined) {
        return json as T;
    }

    return (json.data !== undefined ? json.data : json) as T;
}

// ─── Helpers ─────────────────────────────────────────────
function hasBody(init?: RequestInit): boolean {
    if (!init) return false;
    if (init.body) return true;

    const method = (init.method ?? "GET").toUpperCase();
    return ["POST", "PUT", "PATCH"].includes(method);
}