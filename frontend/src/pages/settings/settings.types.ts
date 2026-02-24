import type { LucideIcon } from "lucide-react"

/* ── Tab definition ── */
export interface TabDef {
    id: string
    label: string
    icon: LucideIcon
    description: string
    badge?: string
    group?: string
}

/* ── Toggle-based setting ── */
export interface ToggleSetting {
    id: string
    label: string
    description: string
    defaultValue: boolean
}

/* ── Selector option (theme picker, language, model, etc.) ── */
export interface SelectorOption<T extends string = string> {
    id: T
    label: string
    description?: string
    icon?: LucideIcon
    emoji?: string
}

/* ── Selector group ── */
export interface SelectorSetting<T extends string = string> {
    id: string
    label: string
    columns?: 2 | 3
    options: SelectorOption<T>[]
    defaultValue: T
}

/* ── Integration item ── */
export interface IntegrationItem {
    name: string
    description: string
    icon: string
    connected: boolean
    status: string
}

/* ── Section card wrapper config ── */
export interface SectionConfig {
    title: string
    description?: string
    icon?: LucideIcon
}
