import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "./endpoints";

let inflightRequest: Promise<void> | null = null;

function hasXsrfCookie(): boolean {
    return /(?:^|;\s*)XSRF-TOKEN=/.test(document.cookie);
}

/**
 * Fetch CSRF cookie from Sanctum.
 * Safe to call multiple times — request will be sent only once.
 */
export async function fetchCsrfToken(): Promise<void> {
    if (hasXsrfCookie()) {
        return;
    }

    if (inflightRequest) {
        return inflightRequest;
    }

    inflightRequest = (async () => {
        const res = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.csrf}`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch CSRF token");
        }

        if (!hasXsrfCookie()) {
            throw new Error("CSRF cookie was not set by backend");
        }
    })();

    try {
        await inflightRequest;
    } finally {
        inflightRequest = null;
    }
}
