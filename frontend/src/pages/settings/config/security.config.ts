import type { SectionConfig } from "../settings.types"
import { ShieldCheckIcon, KeyRoundIcon } from "lucide-react"

export const passwordSection: SectionConfig = {
    title: "Пароль",
    icon: KeyRoundIcon,
}

export const twoFASection: SectionConfig = {
    title: "Двофакторна автентифікація",
    icon: ShieldCheckIcon,
    description: "Додатковий рівень захисту аккаунту",
}

export const sessionsSection: SectionConfig = {
    title: "Активні сесії",
    description: "Пристрої, з яких ви увійшли",
}
