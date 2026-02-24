import { BookOpenIcon, ListChecksIcon } from "lucide-react"
import type { SelectorOption, ToggleSetting, SectionConfig } from "../settings.types"

export const plannerSection: SectionConfig = {
    title: "Планер",
    icon: BookOpenIcon,
}

export const tasksSection: SectionConfig = {
    title: "Завдання та трекер",
    icon: ListChecksIcon,
}

export const plannerViewOptions: SelectorOption[] = [
    { id: "day", label: "Денний" },
    { id: "week", label: "Тижневий" },
]

export const plannerToggles: ToggleSetting[] = [
    { id: "focusBlocks", label: "Блоки фокус-часу", description: "Додавати блоки концентрації до планера", defaultValue: true },
    { id: "dragReorder", label: "Перетягування задач", description: "Реорганізація задач через drag & drop", defaultValue: true },
    { id: "dailyReview", label: "Щоденний огляд", description: "Підсумок виконаних задач наприкінці дня", defaultValue: false },
]

export const tasksToggles: ToggleSetting[] = [
    { id: "subtasks", label: "Підзадачі", description: "Дозволити розбивати задачі на підзадачі", defaultValue: true },
    { id: "categories", label: "Категорії задач", description: "Навчання / особисте / робота", defaultValue: true },
    { id: "progressTracker", label: "Трекер прогресу", description: "Відсоток виконання та аналітика активності", defaultValue: true },
    { id: "aiSuggestions", label: "AI-пропозиції", description: "AI розбиває задачі на етапи та пропонує оптимальний розклад", defaultValue: true },
]
