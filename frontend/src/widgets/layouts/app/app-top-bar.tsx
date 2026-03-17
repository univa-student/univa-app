import { useAppFrame } from "./app-frame"
import { SearchIcon, BellIcon, SidebarIcon } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/shadcn/ui/tooltip"
import { useThemeLogo } from "@/shared/hooks/useThemeLogo"
import { Link } from "react-router-dom"

export function AppTopBar() {
    const { pageTitle, toggleSidePanel, sidePanelOpen } = useAppFrame()
    const logoSrc = useThemeLogo("logo-no-bg")

    return (
        <header className="app-top-bar">
            {/* ── Left: logo ── */}
            <div className="flex items-center flex-shrink-0">
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center size-[28px] rounded-md hover:bg-accent/60 transition-colors"
                        >
                            <img src={logoSrc} alt="Univa" className="size-5 object-contain" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Дашборд</TooltipContent>
                </Tooltip>
            </div>

            {/* ── Center: page title + optional side panel toggle ── */}
            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleSidePanel}
                            className={[
                                "flex size-[26px] items-center justify-center rounded-md border border-transparent transition-all",
                                "outline-none cursor-pointer",
                                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                sidePanelOpen
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-transparent hover:bg-accent/90 hover:text-foreground",
                            ].join(" ")}
                            aria-label="Бокова панель"
                            type="button"
                        >
                            <SidebarIcon className="size-[16px]" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Бокова панель (Ctrl+B)</TooltipContent>
                </Tooltip>

                <span className="text-[12px] font-medium text-foreground/80 truncate">
                    {pageTitle}
                </span>
            </div>

            {/* ── Right: clock + utility icons ── */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <button className="app-top-bar-icon" aria-label="Пошук">
                            <SearchIcon className="size-[16px]" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Пошук</TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <button className="app-top-bar-icon" aria-label="Сповіщення">
                            <BellIcon className="size-[16px]" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Сповіщення</TooltipContent>
                </Tooltip>

                {/* Page-specific top-bar actions portal */}
                <div id="app-top-bar-actions" />
            </div>
        </header>
    )
}
