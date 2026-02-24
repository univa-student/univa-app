import React from "react";
import { Link } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/shadcn/ui/sidebar.tsx";
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
}

export function DashboardLayout({ children, breadcrumbs = [] }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />

                        {breadcrumbs.length > 0 && (
                            <>
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 h-4"
                                />
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        {breadcrumbs.map((crumb, index) => {
                                            const isLast = index === breadcrumbs.length - 1;

                                            return (
                                                <React.Fragment key={crumb.label}>
                                                    {index > 0 && (
                                                        <BreadcrumbSeparator className="hidden md:block" />
                                                    )}
                                                    <BreadcrumbItem className={index < breadcrumbs.length - 1 ? "hidden md:block" : ""}>
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
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
