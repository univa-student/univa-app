import { Link } from "react-router-dom"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/shadcn/ui/sidebar"

import logoConfig from "@/app/config/logo.config"

export function AppPageSidebarLogo() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    size="lg"
                    className="hover:bg-transparent active:bg-transparent"
                >
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center">
                            <img
                                src={logoConfig["logo-white-no-bg"]}
                                alt="Univa"
                                className="h-7 w-auto object-contain dark:hidden"
                            />
                            <img
                                src={logoConfig["logo-black-no-bg"]}
                                alt="Univa"
                                className="h-7 w-auto object-contain hidden dark:block"
                            />
                        </div>

                        <div className="grid text-left text-sm leading-tight">
                            <span className="truncate font-bold text-base tracking-tight">
                                Univa
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                Student workspace
                            </span>
                        </div>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}