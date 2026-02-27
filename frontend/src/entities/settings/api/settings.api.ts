import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SettingEnumOption {
    value: string;
    label: string;
}

export interface SettingConstraints {
    min?: number;
    max?: number;
    regex?: string;
}

export interface SettingItem {
    key: string;
    type: "bool" | "int" | "string" | "json" | "enum";
    label: string;
    description: string | null;
    value: unknown;
    enumOptions: SettingEnumOption[] | null;
    constraints: SettingConstraints | null;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch all settings for a given group ID.
 */
export async function fetchSettingsGroup(groupId: number): Promise<SettingItem[]> {
    return apiFetch<SettingItem[]>(ENDPOINTS.settings.group(groupId));
}

/**
 * Update a single setting value by key.
 */
export async function updateSetting(key: string, value: unknown): Promise<void> {
    await apiFetch<void>(ENDPOINTS.settings.update(key), {
        method: "PATCH",
        body: JSON.stringify({ value }),
    });
}
