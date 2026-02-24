import type { IntegrationItem } from "../settings.types"

export const integrations: IntegrationItem[] = [
    { name: "Google Calendar", description: "Синхронізація розкладу", icon: "📅", connected: true, status: "Синхронізовано" },
    { name: "Google Drive", description: "Резервне копіювання файлів", icon: "📁", connected: true, status: "Підключено" },
    { name: "Telegram", description: "Сповіщення в Telegram", icon: "💬", connected: false, status: "" },
    { name: "Notion", description: "Експорт нотаток", icon: "📝", connected: false, status: "" },
    { name: "GitHub", description: "Автосинхронізація проєктів", icon: "🐙", connected: false, status: "" },
    { name: "Moodle", description: "Імпорт оцінок та курсів", icon: "🎓", connected: false, status: "" },
]
