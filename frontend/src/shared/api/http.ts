import { API_BASE_URL } from "@/app/config/app.config";
import { ApiError } from "@/shared/types/api";

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
    init?: RequestInit,
): Promise<T> {
    const xsrf = getXsrfToken();

    const body = init?.body as any;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",

            // IMPORTANT: тільки для НЕ-FormData
            ...(hasBody(init) && !isFormData ? { "Content-Type": "application/json" } : {}),

            ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),

            // якщо хтось передав headers ззовні
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({
            message: `HTTP ${res.status}`,
        }));

        throw new ApiError(res.status, {
            message: body.message ?? `HTTP ${res.status}`,
            errors: body.errors,
        });
    }

    if (res.status === 204) return undefined as T;

    const json = await res.json();
    return (json.data !== undefined ? json.data : json) as T;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Check if the request has a body (POST/PUT/PATCH/DELETE with body) */
function hasBody(init?: RequestInit): boolean {
    if (!init) return false;
    if (init.body) return true;
    const method = (init.method ?? "GET").toUpperCase();
    return method === "POST" || method === "PUT" || method === "PATCH";
}
