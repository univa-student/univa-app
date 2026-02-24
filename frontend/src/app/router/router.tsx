import { createBrowserRouter } from "react-router-dom";

import { LazyBoundary } from "@/shared/ui/lazy-boundary";
import { UiKitPage } from "@/pages/ui-kit/ui-kit.page.tsx";
import { RouterErrorPage } from "@/shared/ui/error-boudary/router-error-boundary.tsx";
import { UiKitLayout } from "@/widgets/layouts/ui-kit/ui-kit.layout.tsx";
import { HomePage } from "@/pages/main/home.page.tsx";
import { LandingPage } from "@/pages/main/landing.page.tsx";
import { SettingsPage } from "@/pages/settings/settings.page.tsx";
import { DashboardLayout } from "@/widgets/layouts/app/dashboard.layout.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <LazyBoundary>
                <LandingPage />
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },
    {
        path: "/dashboard",

        element: (
            <LazyBoundary>
                <DashboardLayout breadcrumbs={[
                    { label: "Головна", href: "/dashboard" },
                    { label: "Дашборд" },
                ]}>
                    <HomePage />
                </DashboardLayout>
            </LazyBoundary>
        ),

        errorElement: <RouterErrorPage />
    },
    {
        path: "/dashboard/settings",
        element: (
            <LazyBoundary>
                <DashboardLayout breadcrumbs={[
                    { label: "Головна", href: "/dashboard" },
                    { label: "Налаштування" },
                ]}>
                    <SettingsPage />
                </DashboardLayout>
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },
    {
        path: "/ui-kit-page",
        element: (
            <LazyBoundary>
                <UiKitLayout>
                    <UiKitPage />
                </UiKitLayout>
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },
    // {
    //     path: "*",
    //     element: <NotFoundPage />
    // },
]);
