import { createBrowserRouter } from "react-router-dom";

import { LazyBoundary } from "@/shared/ui/lazy-boundary";
import { UiKitPage } from "@/pages/ui-kit/ui-kit.page.tsx";
import { RouterErrorPage } from "@/shared/ui/error-boudary/router-error-boundary.tsx";
import { UiKitLayout } from "@/widgets/layouts/ui-kit/ui-kit.layout.tsx";
import { HomePage } from "@/pages/main/home.page.tsx";
import { LandingPage } from "@/pages/main/landing.page.tsx";
import { DocsPage } from "@/pages/main/docs.page.tsx";
import { AboutPage } from "@/pages/main/about.page.tsx";
import { SettingsPage } from "@/pages/settings/settings.page.tsx";
import { DashboardLayout } from "@/widgets/layouts/app/dashboard.layout.tsx";
import { LoginPage } from "@/pages/auth/login.page.tsx";
import { RegisterPage } from "@/pages/auth/register.page.tsx";
import { AuthGuard } from "@/processes/auth-guard/auth-guard.tsx";
import { GuestGuard } from "@/processes/guest-guard/guest-guard.tsx";

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

    // ── Public pages ────────────────────────────────────────────────────────
    {
        path: "/docs",
        element: (
            <LazyBoundary>
                <DocsPage />
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },
    {
        path: "/about",
        element: (
            <LazyBoundary>
                <AboutPage />
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },

    // ── Auth (guest-only) ────────────────────────────────────────────────────
    {
        path: "/login",
        element: (
            <LazyBoundary>
                <GuestGuard>
                    <LoginPage />
                </GuestGuard>
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },
    {
        path: "/register",
        element: (
            <LazyBoundary>
                <GuestGuard>
                    <RegisterPage />
                </GuestGuard>
            </LazyBoundary>
        ),
        errorElement: <RouterErrorPage />
    },

    // ── Dashboard (protected) ────────────────────────────────────────────────
    {
        path: "/dashboard",

        element: (
            <LazyBoundary>
                <AuthGuard>
                    <DashboardLayout breadcrumbs={[
                        { label: "Головна", href: "/dashboard" },
                        { label: "Дашборд" },
                    ]}>
                        <HomePage />
                    </DashboardLayout>
                </AuthGuard>
            </LazyBoundary>
        ),

        errorElement: <RouterErrorPage />
    },
    {
        path: "/dashboard/settings",
        element: (
            <LazyBoundary>
                <AuthGuard>
                    <DashboardLayout breadcrumbs={[
                        { label: "Головна", href: "/dashboard" },
                        { label: "Налаштування" },
                    ]}>
                        <SettingsPage />
                    </DashboardLayout>
                </AuthGuard>
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
