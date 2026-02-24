import {
    UserIcon,
    ShieldCheckIcon,
    BellIcon,
    PaletteIcon,
    LockIcon,
    SparklesIcon,
    CalendarIcon,
    MessageSquareIcon,
    HardDriveIcon,
    LayoutListIcon,
    LinkIcon,
    Trash2Icon,
} from "lucide-react"
import type { TabDef } from "../settings.types"

export const tabs: TabDef[] = [
    { id: "account", label: "Аккаунт", icon: UserIcon, description: "Профіль, освіта та особисті дані", group: "Загальне" },
    { id: "security", label: "Безпека", icon: ShieldCheckIcon, description: "Пароль, 2FA, активні сесії" },
    { id: "notifications", label: "Сповіщення", icon: BellIcon, description: "Email та push-повідомлення" },
    { id: "appearance", label: "Зовнішній вигляд", icon: PaletteIcon, description: "Тема, мова та інтерфейс" },
    { id: "privacy", label: "Конфіденційність", icon: LockIcon, description: "Видимість профілю та дані" },
    { id: "ai", label: "AI-помічник", icon: SparklesIcon, description: "Модель, стиль та поведінка AI", badge: "Нове", group: "Модулі" },
    { id: "calendar", label: "Розклад", icon: CalendarIcon, description: "Дедлайни, нагадування та формат" },
    { id: "chats", label: "Чати", icon: MessageSquareIcon, description: "Повідомлення, медіа та звуки" },
    { id: "files", label: "Файли", icon: HardDriveIcon, description: "Сховище, синхронізація та перегляд" },
    { id: "organizer", label: "Органайзер", icon: LayoutListIcon, description: "Планер, нотатки та трекер" },
    { id: "integrations", label: "Інтеграції", icon: LinkIcon, description: "Підключені сервіси", group: "Інше" },
    { id: "danger", label: "Небезпечна зона", icon: Trash2Icon, description: "Видалення аккаунту" },
]
