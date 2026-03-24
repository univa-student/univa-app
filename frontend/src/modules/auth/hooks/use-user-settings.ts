import { useSyncExternalStore } from "react";
import { DEFAULT_UI_SETTINGS } from "@/modules/auth/lib/settings/map-ui-settings";
import type {UserSettings} from "@/modules/settings/model/types.ts";
import {userSettingsStore} from "@/modules/auth/model/settings-store.ts";

/**
 * useUserSettings
 *
 * Returns the current UI settings from `userSettingsStore`, reactively
 * updating whenever the store changes (e.g., after saving settings).
 *
 * Usage:
 * ```tsx
 * const { compact, animations, theme } = useUserSettings()
 * ```
 */
export function useUserSettings(): UserSettings {
    const ui = useSyncExternalStore(
        userSettingsStore.subscribe,
        () => userSettingsStore.getState().ui,
        () => null, // SSR snapshot — not used in this app
    );
    return ui ?? DEFAULT_UI_SETTINGS;
}
