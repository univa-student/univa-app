import { EyeIcon, LockIcon } from "lucide-react"
import type { ToggleSetting, SectionConfig } from "../settings.types"

export const visibilitySection: SectionConfig = {
    title: "Видимість профілю",
    icon: EyeIcon,
}

export const dataSection: SectionConfig = {
    title: "Дані та конфіденційність",
    icon: LockIcon,
}

export const visibilityToggles: ToggleSetting[] = [
    { id: "showEmail", label: "Показувати email", description: "Інші студенти бачитимуть вашу email-адресу", defaultValue: false },
    { id: "showOnline", label: "Статус онлайн", description: "Показувати, що ви зараз онлайн", defaultValue: true },
    { id: "showLastSeen", label: "Останній візит", description: "Показувати коли ви були в мережі", defaultValue: true },
    { id: "searchIndexing", label: "Пошукова індексація", description: "Дозволити знаходити ваш профіль через пошук", defaultValue: true },
]

export const dataToggles: ToggleSetting[] = [
    { id: "analytics", label: "Аналітика використання", description: "Допомагає покращувати Univa", defaultValue: true },
    { id: "crashReports", label: "Звіти про помилки", description: "Автоматично надсилати звіти", defaultValue: true },
]
