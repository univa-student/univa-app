import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "./endpoints";

/**
 * Fetch CSRF cookie from Sanctum.
 * Must be called once before any state-changing request (login, register, logout).
 */
export async function fetchCsrfToken(): Promise<void> {
    await fetch(`${API_BASE_URL}${ENDPOINTS.auth.csrf}`, {
        credentials: "include",
    });
}
