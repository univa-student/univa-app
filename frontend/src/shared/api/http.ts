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

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...(hasBody(init) ? { "Content-Type": "application/json" } : {}),
            ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
            ...(init?.headers ?? {}),
        },
    });

    // Non-2xx → throw normalized ApiError
    if (!res.ok) {
        const body = await res.json().catch(() => ({
            message: `HTTP ${res.status}`,
        }));

        throw new ApiError(res.status, {
            message: body.message ?? `HTTP ${res.status}`,
            errors: body.errors,
        });
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    const json = await res.json();

    // Laravel ApiResponse wraps payload in `data`
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
