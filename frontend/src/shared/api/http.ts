import { authStore } from "../../entities/user/model/auth-store";
import { API_BASE_URL, LS_KEY_AUTH_TOKEN } from "../config/app.config";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = authStore.getState().token ?? localStorage.getItem(LS_KEY_AUTH_TOKEN);

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        // для Laravel 422/401/403 можна розширити як тобі треба
        throw new Error(`HTTP ${res.status}`);
    }

    return (await res.json()) as T;
}
