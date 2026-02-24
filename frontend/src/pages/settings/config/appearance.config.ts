import { SunIcon, MoonIcon, MonitorIcon, GlobeIcon } from "lucide-react"
import type { SelectorOption, ToggleSetting, SectionConfig } from "../settings.types"

export const themeSection: SectionConfig = { title: "Тема", icon: SunIcon }
export const languageSection: SectionConfig = { title: "Мова інтерфейсу", icon: GlobeIcon }

export const themeOptions: SelectorOption[] = [
    { id: "light", label: "Світла", description: "Легкий інтерфейс", icon: SunIcon },
    { id: "dark", label: "Темна", description: "Зберігає зір", icon: MoonIcon },
    { id: "system", label: "Системна", description: "Автоматично", icon: MonitorIcon },
]

export const languageOptions: SelectorOption[] = [
    { id: "uk", label: "Українська", emoji: "🇺🇦" },
    { id: "en", label: "English", emoji: "🇬🇧" },
    { id: "pl", label: "Polski", emoji: "🇵🇱" },
]

export const interfaceToggles: ToggleSetting[] = [
    { id: "compact", label: "Компактний режим", description: "Зменшити відступи та шрифти", defaultValue: false },
    { id: "animations", label: "Анімації", description: "Плавні переходи між сторінками", defaultValue: true },
]

export const interfaceSection: SectionConfig = { title: "Інтерфейс" }
