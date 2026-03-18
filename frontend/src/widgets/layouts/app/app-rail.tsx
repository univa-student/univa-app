import { Link, useLocation } from "react-router-dom"
import { navItems } from "@/shared/config/nav-items"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/shadcn/ui/tooltip"
export function AppRail() {
    const location = useLocation()

    return (
        <nav className="app-rail">
            {/* ── Navigation icons — flat, no nesting ── */}
            <div className="flex-1 flex flex-col items-center gap-0.5 py-1 overflow-y-auto overflow-x-hidden scrollbar-hidden w-full">
                {navItems.map(item => {
                    const active = item.url === "/dashboard"
                        ? location.pathname === "/dashboard"
                        : location.pathname.startsWith(item.url)
                    const Icon = item.icon

                    return (
                        <Tooltip key={item.url} delayDuration={250}>
                            <TooltipTrigger asChild>
                                <Link
                                    to={item.url}
                                    className={[
                                        "relative flex items-center justify-center size-[40px] rounded-md transition-all duration-150",
                                        active
                                            ? ""
                                            : "hover:bg-accent/20 hover:text-foreground",
                                    ].join(" ")}
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
                    )
                })}
            </div>
        </nav>
    )
}
