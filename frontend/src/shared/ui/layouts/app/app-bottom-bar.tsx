import React, {useEffect, useMemo, useState} from "react"
import {Avatar, AvatarFallback, AvatarImage} from "@/shared/shadcn/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu"
import {CalendarDaysIcon, FolderIcon, LayoutGridIcon, LogOutIcon, SettingsIcon, SparklesIcon,} from "lucide-react"
import {useMutation, useQueryClient} from "@tanstack/react-query"
import {userQueries} from "@/modules/auth/api/queries.ts"
import {authStore} from "@/modules/auth/model/auth-store.ts"
import {useAuthUser} from "@/modules/auth/model/useAuthUser.ts"
import {Link, useLocation, useNavigate} from "react-router-dom"
import {cn} from "@/shared/shadcn/lib/utils"
import {APP_VERSION} from "@/app/config/app.config.ts";

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/)
    return parts.slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase() || "U"
}

function useClock() {
    const [time, setTime] = useState(() => new Date())

    useEffect(() => {
        const id = window.setInterval(() => setTime(new Date()), 1000)
        return () => window.clearInterval(id)
    }, [])

    return time
}

type BottomBarMeta = {
    icon: React.ComponentType<{ className?: string }>
    title: string
    hint: string
}

function useBottomBarMeta(): BottomBarMeta {
    const {pathname} = useLocation()

    return useMemo(() => {
        if (pathname.startsWith("/dashboard/calendar")) {
            return {
                icon: CalendarDaysIcon,
                title: "Календар",
                hint: "Події та дедлайни",
            }
        }

        if (pathname.startsWith("/dashboard/files")) {
            return {
                icon: FolderIcon,
                title: "Файли",
                hint: "Матеріали та папки",
            }
        }

        if (pathname.startsWith("/dashboard/ai")) {
            return {
                icon: SparklesIcon,
                title: "AI",
                hint: "Конспекти та інструменти",
            }
        }

        return {
            icon: LayoutGridIcon,
            title: "Dashboard",
            hint: "Робочий простір",
        }
    }, [pathname])
}

function StatusBadge({
                         children,
                         className,
                     }: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "inline-flex items-center border text-xs whitespace-nowrap transition-colors",
                "rounded-full px-2.5 py-1",
                "border-border/60 bg-muted/30",
                className
            )}
        >
            {children}
        </div>
    )
}

export function AppBottomBar() {
    const user = useAuthUser()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const now = useClock()
    const meta = useBottomBarMeta()

    const {mutate: logout, isPending} = useMutation({
        ...userQueries.logout(),
        onSettled: () => {
            authStore.reset()
            queryClient.clear()
            navigate("/login", {replace: true})
        },
    })

    const userName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Користувач"
    const userEmail = user?.email ?? ""
    const avatarUrl = user?.avatarPath ?? ""

    const timeStr = now.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })

    const dateStr = now.toLocaleDateString("uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long",
    })

    const shortDateStr = now.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })

    const Icon = meta.icon

    return (
        <footer
            className={cn(
                "app-bottom-bar",
                "flex items-center justify-between gap-2",
                "text-xs h-10"
            )}
        >
            <div className="flex min-w-0 items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "flex h-7 items-center gap-2 rounded-md px-1.5 transition-colors",
                                "hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                            aria-label="Профіль"
                        >
                            <Avatar className="size-6 rounded-full">
                                <AvatarImage src={avatarUrl} alt={userName}/>
                                <AvatarFallback
                                    className="rounded-full bg-primary/15 text-[9px] font-semibold text-primary">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>

                            <span
                                className="hidden max-w-[140px] truncate text-[14px] font-medium text-foreground/85 md:block">
                                {userName}
                            </span>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="w-64 rounded-xl"
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-3 py-3">
                                <Avatar className="size-9 rounded-lg">
                                    <AvatarImage src={avatarUrl} alt={userName}/>
                                    <AvatarFallback className="rounded-lg text-xs font-semibold">
                                        {getInitials(userName)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">
                                        {userName}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        {userEmail}
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator/>

                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/settings" className="cursor-pointer">
                                    <SettingsIcon className="size-4"/>
                                    <span>Налаштування</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator/>

                        <DropdownMenuItem
                            disabled={isPending}
                            onClick={(e) => {
                                e.preventDefault()
                                logout()
                            }}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOutIcon className="size-4"/>
                            <span>{isPending ? "Вихід..." : "Вийти"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden h-4 w-px bg-border/80 sm:block"/>

                <div className="hidden min-w-0 items-center gap-2 text-[13px] text-muted-foreground sm:flex">
                    <Icon className="size-4.5 shrink-0"/>
                    <span className="truncate font-medium text-foreground/80">{meta.title}</span>
                    <span className="text-muted-foreground/50">—</span>
                    <span className="truncate">{meta.hint}</span>
                </div>
            </div>

            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
                <div
                    className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1">
                    <span className="font-medium text-foreground/80">
                        Univa
                    </span>
                    <span className="text-muted-foreground/45">
                        {APP_VERSION}
                    </span>
                </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
                <StatusBadge
                    className="hidden h-8 items-center gap-2 rounded-full border-border/60 bg-muted/35 px-3 md:inline-flex">
                    <CalendarDaysIcon className="size-3.5 shrink-0 text-muted-foreground"/>

                    <span className="max-w-[170px] truncate text-[12px] font-medium capitalize text-foreground/85">
                        {dateStr}
                    </span>

                    <span className="text-muted-foreground/50">•</span>

                    <span className="tabular-nums text-[12px] text-muted-foreground">
                        {shortDateStr}
                    </span>
                </StatusBadge>

                <StatusBadge className="h-8 items-center rounded-full border-border/70 bg-background px-3 shadow-sm">
                    <span className="tabular-nums text-[13px] font-semibold tracking-[0.03em] text-foreground">
                        {timeStr}
                    </span>
                </StatusBadge>

                <div
                    id="app-bottom-bar-content"
                    className="ml-1 flex items-center gap-1.5"
                />
            </div>
        </footer>
    )
}