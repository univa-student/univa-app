import React from "react";
import { Link } from "react-router-dom";

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/shared/shadcn/ui/sidebar.tsx";

import { AppSidebar } from "@/shared/shadcn/components/app/app.page.sidebar.tsx";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/shared/shadcn/ui/breadcrumb.tsx";

import { Separator } from "@/shared/shadcn/ui/separator.tsx";

export interface BreadcrumbEntry {
    label: string;
    href?: string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbEntry[];
    /**
     * When true:
     * - island-main becomes flex-row (side-by-side islands)
     * - content wrapper becomes h-full flex-col (no padding)
     * - `#dashboard-right-panel` island slot is rendered as a sibling to
     *   island-content; pages use ReactDOM.createPortal to inject content there
     */
    fullHeight?: boolean;
}

export function DashboardLayout({
    children,
    breadcrumbs = [],
    fullHeight = false,
}: DashboardLayoutProps) {
    return (
        <div className="island-canvas h-screen" data-island-layout>
            <SidebarProvider className="flex min-h-dvh items-stretch">
                <div className="island-sidebar-wrap flex-shrink-0">
                    <AppSidebar />
                </div>

                <SidebarInset className="flex-1 min-w-0 p-0 bg-transparent shadow-none border-none rounded-none">
                    {/*
                        island-main:
                          - flex-col  (normal pages) — header + content stacked vertically
                          - flex-row  (fullHeight)   — island-content + right-panel island side-by-side
                    */}
                    <div className={`island-main ${fullHeight ? "flex-row" : "flex-col"}`}>

                        {/* ── Content island ─────────────────────────────── */}
                        <div className="island-content flex flex-col flex-1 min-h-0">
                            <header className="island-header h-12 gap-2 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                                <SidebarTrigger />

                                {breadcrumbs.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="mr-1" />
                                        <Breadcrumb>
                                            <BreadcrumbList>
                                                {breadcrumbs.map((crumb, index) => {
                                                    const isLast = index === breadcrumbs.length - 1;
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
                                                    );
                                                })}
                                            </BreadcrumbList>
                                        </Breadcrumb>
                                    </>
                                )}
                            </header>

                            {/* Scroll container */}
                            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
                                <div className={fullHeight ? "h-full flex flex-col" : "flex flex-col gap-4 p-4"}>
                                    {children}
                                </div>
                            </div>
                        </div>

                        {/*
                            ── Right-panel island slot ───────────────────────────
                            Only rendered when fullHeight=true.
                            FilesRightSidebar (and similar) uses ReactDOM.createPortal
                            to inject its content into this div from within the page.
                            This makes it a true sibling island — same visual chrome
                            as the left sidebar, rendered outside island-content.
                        ─────────────────────────────────────────────────────── */}
                        {fullHeight && (
                            <div
                                id="dashboard-right-panel"
                                className="shrink-0 self-stretch flex flex-col"
                                style={{
                                    width: "280px",
                                    background: "var(--island-bg)",
                                    border: "var(--island-border)",
                                    borderRadius: "var(--island-radius)",
                                    boxShadow: "var(--island-shadow)",
                                    overflow: "hidden",
                                }}
                            />
                        )}

                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}