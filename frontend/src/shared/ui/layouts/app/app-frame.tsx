import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    SearchIcon,
    BellIcon,
    SidebarIcon,
    CalendarDaysIcon,
    FolderIcon,
    LayoutGridIcon,
    LogOutIcon,
    SettingsIcon,
    SparklesIcon,
    MaximizeIcon,
    MoonIcon,
    SunIcon,
    UserIcon
} from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/modules/auth/api/queries";
import { authStore } from "@/modules/auth/model/auth-store";
import { useAuthUser } from "@/modules/auth/model/useAuthUser";
import { useUserSettings } from "@/modules/auth/hooks/use-user-settings";
import { userSettingsStore } from "@/modules/settings/model/settings-store";
import { applyDomSettings } from "@/modules/auth/lib/settings/apply-dom-settings";

import { cn } from "@/shared/shadcn/lib/utils";
import { APP_VERSION } from "@/app/config/app.config";
import { navItems } from "@/shared/config/nav-items";
import { useThemeLogo } from "@/shared/hooks/useThemeLogo";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/shared/shadcn/ui/dropdown-menu";

/* ─── Context ────────────────────────────────────────────────────── */

interface AppFrameContextValue {
    pageTitle: string;
    setPageTitle: (title: string) => void;
    sidePanelOpen: boolean;
    toggleSidePanel: () => void;
    setSidePanelOpen: (open: boolean) => void;
    pathname: string;
}

const AppFrameContext = createContext<AppFrameContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAppFrame() {
    const ctx = useContext(AppFrameContext);
    if (!ctx) throw new Error("useAppFrame must be used within <AppFrame />");
    return ctx;
}

/* ─── Shared Utilities ───────────────────────────────────────────────── */

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0] ?? "").join("").toUpperCase() || "U";
}

function useClock() {
    const [time, setTime] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setTime(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return time;
}

type BottomBarMeta = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    hint: string;
};

function useBottomBarMeta(): BottomBarMeta {
    const { pathname } = useLocation();

    return useMemo(() => {
        if (pathname.startsWith("/dashboard/profile")) {
            return { icon: UserIcon, title: "Профіль", hint: "Ваші дані та студентський профіль" };
        }
        if (pathname.startsWith("/dashboard/calendar")) {
            return { icon: CalendarDaysIcon, title: "Календар", hint: "Події та дедлайни" };
        }
        if (pathname.startsWith("/dashboard/files")) {
            return { icon: FolderIcon, title: "Файли", hint: "Матеріали та папки" };
        }
        if (pathname.startsWith("/dashboard/ai")) {
            return { icon: SparklesIcon, title: "AI", hint: "Конспекти та інструменти" };
        }
        return { icon: LayoutGridIcon, title: "Dashboard", hint: "Робочий простір" };
    }, [pathname]);
}

function StatusBadge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div
            className={cn(
                "inline-flex items-center text-xs whitespace-nowrap transition-colors",
                "px-2.5 py-1 rounded-full border border-border/60 bg-muted/30",
                className
            )}
        >
            {children}
        </div>
    );
}

function useFullscreen() {
    return useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => { });
        } else {
            document.exitFullscreen().then(() => { });
        }
    }, []);
}

/* ─── UI Parts ─────────────────────────────────────────────────────── */

function AppTopBar() {
    const { pageTitle, toggleSidePanel, sidePanelOpen } = useAppFrame();
    const logoSrc = useThemeLogo("logo-no-bg");

    return (
        <header className="app-top-bar">
            {/* ── Left: logo ── */}
            <div className="app-top-bar-left">
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center size-[28px] rounded-md"
                        >
                            <img src={logoSrc} alt="Univa" className="size-7 object-contain" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Дашборд
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* ── Center: page title + optional side panel toggle ── */}
            <div className="app-top-bar-center">
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleSidePanel}
                            className={cn(
                                "flex size-[26px] items-center justify-center rounded-md border border-transparent transition-all",
                                "outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                sidePanelOpen
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-transparent hover:bg-accent/90 hover:text-foreground"
                            )}
                            aria-label="Бокова панель"
                            type="button"
                        >
                            <SidebarIcon className="size-[18px]" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Бокова панель (Ctrl+B)
                    </TooltipContent>
                </Tooltip>

                <span className="text-[12px] font-medium text-foreground/80 truncate">
                    {pageTitle}
                </span>
            </div>

            {/* ── Right: clock + utility icons ── */}
            <div className="app-top-bar-right">
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <button className="app-top-bar-icon" aria-label="Пошук">
                            <SearchIcon className="size-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Пошук</TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <Link to="/dashboard/notifications" className="app-top-bar-icon" aria-label="Сповіщення">
                            <BellIcon className="size-5" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Сповіщення</TooltipContent>
                </Tooltip>

                <div id="app-top-bar-actions" />
            </div>
        </header>
    );
}

function AppRail() {
    const { pathname } = useAppFrame();

    return (
        <nav className="app-rail">
            <div className="flex-1 flex flex-col items-center gap-0.5 py-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hidden">
                {navItems.map((item) => {
                    const active = item.url === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.url);

                    const Icon = item.icon;

                    return (
                        <Tooltip key={item.url} delayDuration={250}>
                            <TooltipTrigger asChild>
                                <Link
                                    to={item.url}
                                    className={cn(
                                        "relative flex items-center justify-center size-[40px] rounded-md transition-all duration-150",
                                        active ? "" : "hover:bg-accent/20 hover:text-foreground"
                                    )}
                                    aria-label={item.title}
                                >
                                    <Icon className="size-6" />
                                    {active && (
                                        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-[2.5px] h-6 rounded-full bg-primary" />
                                    )}
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10} className="text-xs">
                                {item.title}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </nav>
    );
}

function AppRightRail() {
    const { theme } = useUserSettings();
    const isDark = theme === "dark";
    const toggleFs = useFullscreen();

    const toggleTheme = useCallback(() => {
        const current = userSettingsStore.getState().ui;
        if (!current) return;

        const next = isDark ? "light" : "dark";
        const updated = { ...current, theme: next as "light" | "dark" };

        userSettingsStore.setAll({
            ui: updated,
            items: userSettingsStore.getState().items,
        });
        applyDomSettings(updated);
    }, [isDark]);

    return (
        <aside className="app-right-rail">
            <div id="app-right-rail-portal" className="flex flex-col items-center gap-0.5 py-1 w-full" />

            <div className="flex flex-col items-center gap-0.5 py-1 w-full mt-auto">
                <Tooltip delayDuration={250}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "flex items-center justify-center size-[40px] rounded-md border-none bg-transparent cursor-pointer",
                                "hover:bg-accent/70 hover:text-foreground transition-colors"
                            )}
                            aria-label={isDark ? "Світла тема" : "Темна тема"}
                        >
                            {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={8}>
                        {isDark ? "Світла тема" : "Темна тема"}
                    </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={250}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleFs}
                            className={cn(
                                "flex items-center justify-center size-[40px] rounded-md border-none bg-transparent cursor-pointer",
                                "hover:bg-accent/70 hover:text-foreground transition-colors"
                            )}
                            aria-label="Повний екран"
                        >
                            <MaximizeIcon className="size-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={8}>
                        Повний екран
                    </TooltipContent>
                </Tooltip>
            </div>
        </aside>
    );
}

function AppBottomBar() {
    const user = useAuthUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const now = useClock();
    const meta = useBottomBarMeta();

    const { mutate: logout, isPending } = useMutation({
        ...userQueries.logout(),
        onSettled: () => {
            authStore.reset();
            queryClient.clear();
            navigate("/login", { replace: true });
        },
    });

    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Користувач";
    const userEmail = user?.email ?? "";
    const avatarUrl = user?.avatarPath ?? "";

    const timeStr = now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" });
    const shortDateStr = now.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
    const Icon = meta.icon;

    return (
        <footer className="app-bottom-bar flex items-center justify-between gap-2 text-xs w-full px-2">

            {/* ── Profile & Helper Text ── */}
            <div className="flex flex-1 items-center gap-2 min-w-0">
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
                                <AvatarImage src={avatarUrl} alt={userName} />
                                <AvatarFallback className="rounded-full bg-primary/15 text-[9px] font-semibold text-primary">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden max-w-[140px] truncate text-[14px] font-medium text-foreground/85 md:block">
                                {userName}
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-64 rounded-xl">
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-3 py-3">
                                <Avatar className="size-9 rounded-lg">
                                    <AvatarImage src={avatarUrl} alt={userName} />
                                    <AvatarFallback className="rounded-lg text-xs font-semibold">
                                        {getInitials(userName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">{userName}</div>
                                    <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/profile" className="cursor-pointer">
                                    <UserIcon className="size-4" />
                                    <span>Мій профіль</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/settings" className="cursor-pointer">
                                    <SettingsIcon className="size-4" />
                                    <span>Налаштування</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={isPending}
                            onClick={(e) => { e.preventDefault(); logout(); }}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOutIcon className="size-4" />
                            <span>{isPending ? "Вихід..." : "Вийти"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden h-4 w-px bg-border/80 sm:block" />

                <div className="hidden min-w-0 items-center gap-2 text-[13px] text-muted-foreground sm:flex">
                    <Icon className="size-4.5 shrink-0" />
                    <span className="truncate font-medium text-foreground/80">{meta.title}</span>
                    <span className="text-muted-foreground/50">—</span>
                    <span className="truncate">{meta.hint}</span>
                </div>
            </div>

            {/* ── Center: Version ── */}
            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
                <div className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1">
                    <span className="font-medium text-foreground/80">Univa</span>
                    <span className="text-muted-foreground/45">{APP_VERSION}</span>
                </div>
            </div>

            {/* ── Right: Time & Portal ── */}
            <div className="flex flex-1 justify-end items-center gap-2 min-w-0">
                <StatusBadge className="hidden h-8 items-center gap-2 px-3 md:inline-flex">
                    <CalendarDaysIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="max-w-[170px] truncate text-[12px] font-medium capitalize text-foreground/85">
                        {dateStr}
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="tabular-nums text-[12px] text-muted-foreground">
                        {shortDateStr}
                    </span>
                </StatusBadge>

                <StatusBadge className="h-8 items-center border-border/70 bg-background px-3 shadow-sm">
                    <span className="tabular-nums text-[13px] font-semibold tracking-[0.03em] text-foreground">
                        {timeStr}
                    </span>
                </StatusBadge>

                <div id="app-bottom-bar-content" className="ml-1 flex items-center gap-1.5" />
            </div>
        </footer>
    );
}

/* ─── Provider & Wrapper ───────────────────────────────────────────── */

export function AppFrame({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation();
    const [pageTitle, setPageTitle] = useState("");
    const [sidePanelOpen, setSidePanelOpen] = useState(true);

    const toggleSidePanel = useCallback(() => {
        setSidePanelOpen((prev) => !prev);
    }, []);

    /* Ctrl+B toggle */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleSidePanel();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [toggleSidePanel]);

    const value = useMemo<AppFrameContextValue>(
        () => ({
            pageTitle,
            setPageTitle,
            sidePanelOpen,
            toggleSidePanel,
            setSidePanelOpen,
            pathname,
        }),
        [pageTitle, sidePanelOpen, toggleSidePanel, pathname]
    );

    return (
        <AppFrameContext.Provider value={value}>
            <div className="app-frame island-canvas" data-island-layout>
                <AppTopBar />
                <AppRail />

                <div className="app-center">
                    <div
                        id="app-side-panel"
                        className={cn("app-side-panel", !sidePanelOpen && "!hidden")}
                    />
                    {children}
                </div>

                <AppRightRail />
                <AppBottomBar />
            </div>
        </AppFrameContext.Provider>
    );
}
