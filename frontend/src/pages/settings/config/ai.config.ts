import { BrainIcon, SparklesIcon, ZapIcon, SlidersHorizontalIcon } from "lucide-react"
import type { SelectorOption, ToggleSetting, SectionConfig } from "../settings.types"

export const modelSection: SectionConfig = {
    title: "Модель та продуктивність",
    icon: BrainIcon,
    description: "Обери параметри роботи AI-помічника",
}

export const behaviorSection: SectionConfig = {
    title: "Поведінка AI",
    icon: SparklesIcon,
}

export const modelOptions: SelectorOption[] = [
    { id: "fast", label: "Швидка", description: "Менше контексту, швидші відповіді", icon: ZapIcon },
    { id: "balanced", label: "Збалансована", description: "Оптимальне співвідношення", icon: SlidersHorizontalIcon },
    { id: "advanced", label: "Розширена", description: "Глибокий аналіз, повільніше", icon: BrainIcon },
]

export const creativityOptions: SelectorOption[] = [
    { id: "low", label: "Точний", description: "Фактичні, стримані відповіді" },
    { id: "medium", label: "Збалансований", description: "Поєднання точності та гнучкості" },
    { id: "high", label: "Креативний", description: "Вільні пояснення, аналогії" },
]

export const languageOptions: SelectorOption[] = [
    { id: "uk", label: "Українська", emoji: "🇺🇦" },
    { id: "en", label: "English", emoji: "🇬🇧" },
    { id: "auto", label: "Авто", emoji: "🌐" },
]

export const behaviorToggles: ToggleSetting[] = [
    { id: "contextAware", label: "Контекстність", description: "AI враховує розклад, дедлайни та матеріали", defaultValue: true },
    { id: "autoSummarize", label: "Автопідсумки", description: "AI автоматично створює конспекти з файлів", defaultValue: true },
    { id: "examMode", label: "Режим «Перед іспитом»", description: "Пріоритет підготовки та питань для самоперевірки", defaultValue: false },
    { id: "inlineAI", label: "AI всередині файлів", description: "Показувати кнопки AI-допомоги в переглядачі документів", defaultValue: true },
    { id: "saveHistory", label: "Історія запитів", description: "Зберігати історію діалогів з AI", defaultValue: true },
]
