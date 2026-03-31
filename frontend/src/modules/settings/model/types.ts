import type { LucideIcon } from "lucide-react"

// ─── Settings API shapes ──────────────────────────────────────────────────────

export interface SettingValue {
    id: number;
    value: string;
    label: string;
    meta: Record<string, unknown> | null;
}

export interface SettingItem {
    id: number;
    groupId: number;
    key: string;
    type: "bool" | "int" | "string" | "json" | "enum";
    label: string;
    description: string | null;
    constraints: Record<string, unknown> | null;
    selectedValueId: number | null;
    rawValue?: string | null;
    values: SettingValue[];
}

// ─── User settings API response ───────────────────────────────────────────────

export type UserSettingItem = {
    id: number | null;
    setting: {
        id: number;
        key: string;
        type: string;
        label?: string;
        description?: string | null;
        defaultValueId?: number | null;
    };
    value: {
        id: number | null;
        value: string | null;
        label?: string | null;
        meta?: unknown;
    };
    rawValue?: string | null;
};

export type UserSettingsApiResponse = UserSettingItem[];

// ─── UI settings ──────────────────────────────────────────────────────────────

export type UserSettings = {
    theme: "light" | "dark" | "system";
    language: "uk" | "en" | "pl" | "auto";
    compact: boolean;
    animations: boolean;
};

// ─── Tab definition ───────────────────────────────────────────────────────────

export interface TabDef {
    id: string
    label: string
    icon: LucideIcon
    description: string
    badge?: string
    group?: string
    groupId?: number
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface SettingsState {
    ui: UserSettings | null;
    items: UserSettingItem[];
    isReady: boolean;
}
