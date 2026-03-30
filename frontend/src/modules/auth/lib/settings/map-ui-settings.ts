import type { UserSettings } from "@/modules/settings/model/types";
import type { UserSettingsApiResponse } from "@/modules/auth/api/settings/types";

export const DEFAULT_UI_SETTINGS: UserSettings = {
    theme: "system",
    language: "auto",
    compact: false,
    animations: true,
};

function parseBool(v: unknown): boolean {
    if (v === true || v === "1" || v === 1 || v === "true") return true;
    if (v === false || v === "0" || v === 0 || v === "false") return false;
    return false;
}

function parseTheme(v: unknown): UserSettings["theme"] {
    return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function parseLanguage(v: unknown): UserSettings["language"] {
    // Бек може віддавати "ua", а фронт хоче "uk"
    if (v === "ua") return "uk";
    return v === "uk" || v === "en" || v === "pl" || v === "auto" ? v : "auto";
}

export function mapUiSettings(items: UserSettingsApiResponse): UserSettings {
    const out: UserSettings = { ...DEFAULT_UI_SETTINGS };

    for (const it of items ?? []) {
        const key = it?.setting?.key;
        const raw = it?.value?.value;

        switch (key) {
            case "theme":
            case "appearance.theme":
                out.theme = parseTheme(raw);
                break;

            case "language":
            case "appearance.language":
                out.language = parseLanguage(raw);
                break;

            case "compactMode":
            case "compact":
            case "appearance.compactMode":
            case "appearance.compact":
                out.compact = parseBool(raw);
                break;

            case "animations":
            case "appearance.animations":
                out.animations = parseBool(raw);
                break;

            default:
                // інші налаштування поки не чіпаємо
                break;
        }
    }

    return out;
}
