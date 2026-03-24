import {MaximizeIcon, MoonIcon, SunIcon,} from "lucide-react"
import {Tooltip, TooltipContent, TooltipTrigger,} from "@/shared/shadcn/ui/tooltip"
import {useCallback} from "react"
import {useUserSettings} from "@/modules/auth/hooks/use-user-settings"
import {userSettingsStore} from "@/modules/settings/model/settings-store"
import {applyDomSettings} from "@/modules/auth/lib/settings/apply-dom-settings"

function useFullscreen() {
    return useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {})
        } else {
            document.exitFullscreen().then(() => {})
        }
    }, [])
}

export function AppRightRail() {
    const { theme } = useUserSettings()
    const isDark = theme === "dark"
    const toggleFs = useFullscreen()

    const toggleTheme = useCallback(() => {
        const current = userSettingsStore.getState().ui
        if (!current) return

        const next = isDark ? "light" : "dark"
        const updated = { ...current, theme: next as "light" | "dark" }

        // Apply instantly to DOM — no server call needed for quick toggle
        userSettingsStore.setAll({
            ui: updated,
            items: userSettingsStore.getState().items,
        })
        applyDomSettings(updated)
    }, [isDark])

    return (
        <aside className="app-right-rail">
            {/* Top: portal slot for page-specific right rail content */}
            <div
                id="app-right-rail-portal"
                className="flex flex-col items-center gap-0.5 py-1 w-full"
            />

            {/* Bottom: global utility toggles */}
            <div className="flex flex-col items-center gap-0.5 py-1 w-full mt-auto">
                <Tooltip delayDuration={250}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center size-[40px] rounded-md hover:bg-accent/70 hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
                            aria-label={isDark ? "Світла тема" : "Темна тема"}
                        >
                            {isDark
                                ? <SunIcon className="size-5" />
                                : <MoonIcon className="size-5" />
                            }
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
                            className="flex items-center justify-center size-[40px] rounded-md hover:bg-accent/70 hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
                            aria-label="Повний екран"
                        >
                            <MaximizeIcon className="size-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={8}>Повний екран</TooltipContent>
                </Tooltip>
            </div>
        </aside>
    )
}
