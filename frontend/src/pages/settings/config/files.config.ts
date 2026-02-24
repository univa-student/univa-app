import { FolderOpenIcon, SearchIcon } from "lucide-react"
import type { SelectorOption, ToggleSetting, SectionConfig } from "../settings.types"

export const storageSection: SectionConfig = {
    title: "Сховище та організація",
    icon: FolderOpenIcon,
}

export const searchSection: SectionConfig = {
    title: "Перегляд та пошук",
    icon: SearchIcon,
}

export const storageToggles: ToggleSetting[] = [
    { id: "autoCategorize", label: "Автокатегоризація", description: "Автоматично створювати папки по предметах", defaultValue: true },
    { id: "dragDrop", label: "Drag & Drop", description: "Завантаження файлів перетягуванням", defaultValue: true },
    { id: "storageAlerts", label: "Попередження про обсяг", description: "Сповіщувати, коли сховище майже заповнене", defaultValue: true },
    { id: "versionHistory", label: "Історія версій", description: "Зберігати попередні версії змінених файлів", defaultValue: true },
]

export const previewQualityOptions: SelectorOption[] = [
    { id: "low", label: "Низька", description: "Економить трафік" },
    { id: "medium", label: "Середня", description: "Оптимально" },
    { id: "high", label: "Висока", description: "Детальний перегляд" },
]

export const searchToggles: ToggleSetting[] = [
    { id: "searchHistory", label: "Історія пошуку", description: "Зберігати останні пошукові запити", defaultValue: true },
    { id: "recentFiles", label: "Нещодавні файли", description: "Показувати останні відкриті файли на головній", defaultValue: true },
    { id: "aiAnalysis", label: "AI-аналіз файлів", description: "Автоматичний конспект та ключові теми з документів", defaultValue: true },
]
