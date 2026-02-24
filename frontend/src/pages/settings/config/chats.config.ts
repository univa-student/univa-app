import { UsersIcon, SparklesIcon } from "lucide-react"
import type { ToggleSetting, SectionConfig } from "../settings.types"

export const messagesSection: SectionConfig = {
    title: "Повідомлення",
    icon: UsersIcon,
    description: "Поведінка чатів та груп",
}

export const smartSection: SectionConfig = {
    title: "Розумні функції чатів",
    icon: SparklesIcon,
}

export const messagesToggles: ToggleSetting[] = [
    { id: "readReceipts", label: "Підтвердження прочитання", description: "Показувати, що ви прочитали повідомлення", defaultValue: true },
    { id: "typingIndicator", label: "Індикатор набору", description: "Показувати, що ви набираєте повідомлення", defaultValue: true },
    { id: "messagePreview", label: "Попередній перегляд", description: "Показувати текст повідомлень у сповіщеннях", defaultValue: true },
    { id: "chatSounds", label: "Звуки повідомлень", description: "Звуковий сигнал при нових повідомленнях", defaultValue: true },
]

export const smartToggles: ToggleSetting[] = [
    { id: "mediaAutoDownload", label: "Автозавантаження медіа", description: "Автоматично завантажувати фото та файли з чатів", defaultValue: true },
    { id: "aiSummarize", label: "AI-підсумки обговорень", description: "Створювати конспект із довгих обговорень", defaultValue: true },
    { id: "pinImportant", label: "Автозакріплення важливого", description: "Автоматично закріплювати дедлайни та інструкції", defaultValue: true },
    { id: "linkFiles", label: "Зв'язок файлів з предметами", description: "Файли з чатів автоматично зберігаються у сховищі", defaultValue: true },
]
