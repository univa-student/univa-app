import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "./endpoints";

let _fetched = false;

/**
 * Fetch CSRF cookie from Sanctum.
 * Safe to call multiple times — request will be sent only once.
 */
export async function fetchCsrfToken(): Promise<void> {
    if (_fetched) return;

    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.csrf}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch CSRF token");
    }

    _fetched = true;
}