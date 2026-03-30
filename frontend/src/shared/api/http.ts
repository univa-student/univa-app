import { API_BASE_URL } from "@/app/config/app.config";
import { authStore } from "@/modules/auth/model/auth-store";
import { toast } from "@/shared/lib/toast-store";
import { ApiError } from "@/shared/types/api";
import type { ApiFetchOptions, AlertVariant } from "@/shared/types/api";
import { fetchCsrfToken } from "./csrf";

export type { ApiFetchOptions };

const RESPONSE_CACHE_PREFIX = "univa:api-cache:v1";
const inflightGetRequests = new Map<string, Promise<unknown>>();

function triggerAlert(status: number, message?: string) {
    if (!message) return;

    let variant: AlertVariant = "info";

    if (status === 200 || status === 201) variant = "success";
    else if (status === 400 || status === 422) variant = "warning";
    else if (status >= 400) variant = "destructive";

    toast({ variant, message });
}

function getXsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function getCacheNamespace(): string {
    const userId = authStore.getState().user?.id;
    return userId ? `user:${userId}` : "guest";
}

function buildRequestKey(method: string, path: string): string {
    return `${RESPONSE_CACHE_PREFIX}:${getCacheNamespace()}:${method}:${API_BASE_URL}${path}`;
}

function readCachedResponse<T>(key: string): T | null {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as { expiresAt: number; value: T };
        if (Date.now() > parsed.expiresAt) {
            sessionStorage.removeItem(key);
            return null;
        }

        return parsed.value;
    } catch {
        return null;
    }
}

function writeCachedResponse<T>(key: string, value: T, ttlMs: number): void {
    if (ttlMs <= 0) return;

    try {
        sessionStorage.setItem(key, JSON.stringify({
            expiresAt: Date.now() + ttlMs,
            value,
        }));
    } catch {
        // Ignore storage access / quota errors.
    }
}

function clearResponseCache(): void {
    try {
        const keysToRemove: string[] = [];

        for (let index = 0; index < sessionStorage.length; index += 1) {
            const key = sessionStorage.key(index);
            if (key?.startsWith(RESPONSE_CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    } catch {
        // Ignore storage access errors.
    }
}

export async function apiFetch<T>(
    path: string,
    init: ApiFetchOptions = {},
): Promise<T> {
    const { silent401 = false, skipCsrf = false, cacheTtlMs = 0, ...requestInit } = init;

    const method = (requestInit.method ?? "GET").toUpperCase();
    const requestKey = buildRequestKey(method, path);
    const isCacheableGet = method === "GET" && cacheTtlMs > 0;

    if (isCacheableGet) {
        const cached = readCachedResponse<T>(requestKey);
        if (cached !== null) {
            return cached;
        }
    }

    if (method === "GET") {
        const inflight = inflightGetRequests.get(requestKey);
        if (inflight) {
            return inflight as Promise<T>;
        }
    }

    const requestPromise = (async () => {
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

        if (typeof json.message === "string") {
            triggerAlert(res.status, json.message);
        }

        const normalized = (res.status === 204
            ? undefined
            : json.data !== undefined && json.meta !== undefined
                ? json
                : json.data !== undefined ? json.data : json) as T;

        if (isCacheableGet) {
            writeCachedResponse(requestKey, normalized, cacheTtlMs);
        }

        if (method !== "GET") {
            clearResponseCache();
        }

        return normalized;
    })();

    if (method === "GET") {
        inflightGetRequests.set(requestKey, requestPromise);
    }

    try {
        return await requestPromise;
    } finally {
        if (method === "GET") {
            inflightGetRequests.delete(requestKey);
        }
    }
}

function hasBody(init?: RequestInit): boolean {
    if (!init) return false;
    if (init.body) return true;

    const method = (init.method ?? "GET").toUpperCase();
    return ["POST", "PUT", "PATCH"].includes(method);
}
