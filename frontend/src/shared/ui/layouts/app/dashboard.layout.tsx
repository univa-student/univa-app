import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import { useAppFrame } from "./app-frame"
import { AppRail } from "./app-rail"
import { AppTopBar } from "./app-top-bar"
import { AppBottomBar } from "./app-bottom-bar"
import { AppRightRail } from "./app-right-rail"

import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/shared/shadcn/ui/breadcrumb.tsx"
import type { BreadcrumbEntry } from "@/shared/types/ui"

export type { BreadcrumbEntry };

interface DashboardLayoutProps {
    children: React.ReactNode
    breadcrumbs?: BreadcrumbEntry[]
    /**
     * When true the content wrapper fills height (no padding), useful for
     * calendar / files pages. Also renders #dashboard-right-panel portal slot
     * as a sibling island.
     */
    fullHeight?: boolean
}

export function DashboardLayout({
    children,
    breadcrumbs = [],
    fullHeight = false,
}: DashboardLayoutProps) {
    const { setPageTitle, sidePanelOpen } = useAppFrame()

    /* Derive page title from last breadcrumb */
    useEffect(() => {
        const last = breadcrumbs[breadcrumbs.length - 1]
        setPageTitle(last?.label ?? "")
    }, [breadcrumbs, setPageTitle])

    return (
        <>
            <AppTopBar />
            <AppRail />
            <div className="app-center">
                <div id="app-side-panel" className={["app-side-panel", !sidePanelOpen && "!hidden"].filter(Boolean).join(" ")} />
                <div className="island-content">
                    {/* Breadcrumb header */}
                    {breadcrumbs.length > 0 && (
                        <header className="island-header">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbs.map((crumb, index) => {
                                        const isLast = index === breadcrumbs.length - 1
                                        return (
                                            <React.Fragment key={crumb.label}>
                                                {index > 0 && (
                                                    <BreadcrumbSeparator className="hidden md:block" />
                                                )}
                                                <BreadcrumbItem
                                                    className={
                                                        index < breadcrumbs.length - 1
                                                            ? "hidden md:block"
                                                            : ""
                                                    }
                                                >
                                                    {isLast || !crumb.href ? (
                                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                                    ) : (
                                                        <BreadcrumbLink asChild>
                                                            <Link to={crumb.href}>{crumb.label}</Link>
                                                        </BreadcrumbLink>
                                                    )}
                                                </BreadcrumbItem>
                                            </React.Fragment>
                                        )
                                    })}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </header>
                    )}

                    {/* Scroll container */}
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
                        <div className={fullHeight ? "h-full flex flex-col" : "flex flex-col gap-4 p-4"}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <AppRightRail />
            <AppBottomBar />
        </>
    )
}