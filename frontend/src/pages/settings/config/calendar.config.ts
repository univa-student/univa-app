import { CalendarIcon, ClockIcon } from "lucide-react"
import type { SelectorOption, ToggleSetting, SectionConfig } from "../settings.types"

export const formatSection: SectionConfig = {
    title: "Формат розкладу",
    icon: CalendarIcon,
}

export const deadlinesSection: SectionConfig = {
    title: "Дедлайни та нагадування",
    icon: ClockIcon,
}

export const firstDayOptions: SelectorOption[] = [
    { id: "mon", label: "Понеділок" },
    { id: "sun", label: "Неділя" },
]

export const viewOptions: SelectorOption[] = [
    { id: "day", label: "День" },
    { id: "week", label: "Тиждень" },
]

export const reminderOptions: SelectorOption[] = [
    { id: "15", label: "15 хв" },
    { id: "30", label: "30 хв" },
    { id: "60", label: "1 година" },
]

export const deadlineToggles: ToggleSetting[] = [
    { id: "autoRepeat", label: "Автоповторення пар", description: "Автоматично повторювати розклад щотижня", defaultValue: true },
    { id: "showCountdown", label: "Відлік до подій", description: "Показувати зворотний відлік до іспитів", defaultValue: true },
    { id: "weekOverview", label: "Тижневий огляд", description: "Показувати аналітику навантаження на тиждень", defaultValue: true },
    { id: "overloadAlerts", label: "Сповіщення про перевантаження", description: "Підсвічувати дні з надмірним навантаженням", defaultValue: true },
    { id: "aiPlanning", label: "AI-планування підготовки", description: "AI будує план підготовки до іспитів та курсових", defaultValue: true },
]
