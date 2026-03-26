import {
    AlertCircleIcon,
    BookCheckIcon,
    BotIcon,
    CalendarDaysIcon,
    FolderOpenIcon,
    LayoutDashboardIcon,
    ListChecksIcon,
    MessagesSquareIcon,
    Settings2Icon,
    UsersIcon,
    type LucideIcon,
} from "lucide-react"

export interface NavSubItem {
    title: string
    url: string
}

export interface NavItem {
    title: string
    url: string
    icon: LucideIcon
    items: NavSubItem[]
}

export const navItems: NavItem[] = [
    {
        title: "Дашборд",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
        items: [],
    },
    {
        title: "Календар",
        url: "/dashboard/schedule/calendar",
        icon: CalendarDaysIcon,
        items: [],
    },
    {
        title: "Предмети",
        url: "/dashboard/schedule/subjects",
        icon: BookCheckIcon,
        items: [],
    },
    {
        title: "Групи",
        url: "/dashboard/groups",
        icon: UsersIcon,
        items: [],
    },
    {
        title: "Дедлайни",
        url: "/dashboard/deadlines",
        icon: AlertCircleIcon,
        items: [],
    },
    {
        title: "Файли",
        url: "/dashboard/files",
        icon: FolderOpenIcon,
        items: [],
    },
    {
        title: "Друзі",
        url: "/dashboard/friends",
        icon: UsersIcon,
        items: [],
    },
    {
        title: "Чати",
        url: "/dashboard/chats",
        icon: MessagesSquareIcon,
        items: [],
    },
    {
        title: "AI-помічник",
        url: "/dashboard/ai",
        icon: BotIcon,
        items: [],
    },
    {
        title: "Органайзер",
        url: "/dashboard/organizer",
        icon: ListChecksIcon,
        items: [
            { title: "To-do", url: "/dashboard/organizer/to-do" },
            { title: "Нотатки", url: "/dashboard/organizer/notes" },
        ],
    },
    {
        title: "Налаштування",
        url: "/dashboard/settings",
        icon: Settings2Icon,
        items: [],
    },
]
