import * as React from "react"

import { AppPageNavMain } from "@/shared/shadcn/components/app/app.page.nav-main.tsx"
import { AppPageNavUser } from "@/shared/shadcn/components/app/app.page.nav-user.tsx"
import { AppPageSidebarLogo } from "@/shared/shadcn/components/app/app.page.sidebar-logo.tsx"
import { SidebarCalendar } from "@/shared/shadcn/components/app/sidebar-calendar.tsx"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/shared/shadcn/ui/sidebar.tsx"

import {
    LayoutDashboardIcon,
    CalendarDaysIcon,
    FolderOpenIcon,
    MessagesSquareIcon,
    BotIcon,
    ListChecksIcon,
    Settings2Icon,
} from "lucide-react"

const data = {
    user: {
        name: "Anastasiia",
        email: "a@example.com",
        avatar: "/avatars/default.jpg",
    },

    navMain: [
        {
            title: "Дашборд",
            url: "/dashboard",
            icon: <LayoutDashboardIcon />,
            isActive: true,
            items: [],
        },
        {
            title: "Розклад",
            url: "/dashboard/schedule",
            icon: <CalendarDaysIcon />,
            items: [
                { title: "Тиждень", url: "/dashboard/schedule/week" },
                { title: "Дедлайни", url: "/dashboard/schedule/deadlines" },
            ],
        },
        {
            title: "Файли",
            url: "/dashboard/files",
            icon: <FolderOpenIcon />,
            items: [],
        },
        {
            title: "Чати",
            url: "/dashboard/chats",
            icon: <MessagesSquareIcon />,
            items: [],
        },
        {
            title: "AI-помічник",
            url: "/dashboard/ai",
            icon: <BotIcon />,
            items: [],
        },
        {
            title: "Органайзер",
            url: "/dashboard/organizer",
            icon: <ListChecksIcon />,
            items: [
                { title: "To-do", url: "/dashboard/organizer/todo" },
                { title: "Нотатки", url: "/dashboard/organizer/notes" },
            ],
        },
        {
            title: "Налаштування",
            url: "/dashboard/settings",
            icon: <Settings2Icon />,
            items: [],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <AppPageSidebarLogo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarCalendar />
                <AppPageNavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <AppPageNavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
