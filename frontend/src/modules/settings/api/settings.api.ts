import { apiFetch } from "@/shared/api/http";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { SettingValue, SettingItem } from "../model/types";

export type { SettingValue, SettingItem };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the current string value for a setting item.
 * Falls back to the first available value if nothing is selected.
 */
export function getSelectedValue(item: SettingItem): string {
    if (item.rawValue !== null && item.rawValue !== undefined) {
        return String(item.rawValue);
    }
    const selectedId = item.selectedValueId ?? (item as unknown as { selected_value_id?: number | null }).selected_value_id;
    if (selectedId !== null && selectedId !== undefined) {
        const found = item.values.find(v => v.id === selectedId);
        if (found) return String(found.value);
    }
    return item.values?.[0]?.value ? String(item.values[0].value) : "";
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

/**
 * Bulk-update multiple settings in a single HTTP request.
 * Sends PATCH /settings with { settings: [{key, value}, ...] }
 */
export async function bulkUpdateSettings(
    pairs: Array<{ key: string; value: string }>
): Promise<void> {
    await apiFetch<void>(ENDPOINTS.settings.bulk, {
        method: "PATCH",
        body: JSON.stringify({ settings: pairs }),
    });
}
