import type { ToggleSetting, SectionConfig } from "../settings.types"
import { BellRingIcon, MailIcon, SmartphoneIcon } from "lucide-react"

export const emailSection: SectionConfig = {
    title: "Email-сповіщення",
    icon: MailIcon,
}

export const pushSection: SectionConfig = {
    title: "Push-сповіщення",
    icon: SmartphoneIcon,
}

export const soundSection: SectionConfig = {
    title: "Звуки",
    icon: BellRingIcon,
}

const categories = [
    { key: "deadlines", label: "Дедлайни", desc: "Нагадування про терміни здачі" },
    { key: "schedule", label: "Розклад", desc: "Зміни в розкладі та парах" },
    { key: "messages", label: "Повідомлення", desc: "Нові повідомлення в чатах" },
    { key: "ai", label: "AI-помічник", desc: "Готові відповіді та підсумки" },
    { key: "files", label: "Файли", desc: "Нові файли та коментарі" },
    { key: "announcements", label: "Оголошення", desc: "Важливі оголошення від викладачів" },
]

export const emailToggles: ToggleSetting[] = categories.map(c => ({
    id: `email_${c.key}`,
    label: c.label,
    description: c.desc,
    defaultValue: true,
}))

export const pushToggles: ToggleSetting[] = categories.map(c => ({
    id: `push_${c.key}`,
    label: c.label,
    description: c.desc,
    defaultValue: true,
}))

export const soundToggles: ToggleSetting[] = [
    { id: "sound_messages", label: "Звук повідомлень", description: "Аудіо-сигнал при нових повідомленнях", defaultValue: true },
    { id: "sound_notifications", label: "Звук сповіщень", description: "Аудіо-сигнал для системних сповіщень", defaultValue: true },
]
