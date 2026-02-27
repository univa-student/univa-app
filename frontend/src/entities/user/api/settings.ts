import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { UserSettings } from "@/entities/user/model/settings-store";

export async function fetchUserSettings(): Promise<UserSettings> {
    return apiFetch<UserSettings>(ENDPOINTS.settings.me, {
        method: "GET",
    });
}

