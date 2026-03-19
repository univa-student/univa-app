import type { LucideIcon } from "lucide-react"

export interface TabDef {
    id: string
    label: string
    icon: LucideIcon
    description: string
    badge?: string
    group?: string
    groupId?: number
}