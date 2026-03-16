import { createBrowserRouter } from "react-router-dom";

import { LazyBoundary } from "@/shared/ui/lazy-boundary";
import { UiKitPage } from "@/pages/ui-kit/ui-kit.page.tsx";
import { RouterErrorPage } from "@/shared/ui/error-boudary/router-error-boundary.tsx";
import { UiKitLayout } from "@/widgets/layouts/ui-kit/ui-kit.layout.tsx";
import { DashboardPage } from "@/pages/dashboard/dashboard.page.tsx";
import { LandingPage } from "@/pages/main/landing.page.tsx";
import { DocsPage } from "@/pages/main/docs.page.tsx";
import { AboutPage } from "@/pages/main/about.page.tsx";
import { SettingsPage } from "@/pages/settings/settings.page.tsx";
import { DashboardLayout } from "@/widgets/layouts/app/dashboard.layout.tsx";
import { LoginPage } from "@/pages/auth/login.page.tsx";
import { RegisterPage } from "@/pages/auth/register.page.tsx";
import { AuthGuard } from "@/processes/auth-guard/auth-guard.tsx";
import { SubjectsPage } from "@/pages/schedule/subjects/subjects.page.tsx";
import { SubjectDetailPage } from "@/pages/schedule/subjects/subject-detail.page.tsx";
import { TodoPage } from "@/pages/dashboard/organizer/todo.page.tsx";
import { SchedulePage } from "@/pages/schedule/schedule.page.tsx";
import { PlaceholderPage } from "@/pages/dashboard/placeholder.page.tsx";
import { FilesPage } from "@/pages/files/files.page";
import { ChatPage } from "@/pages/chat/chat.page";
import { DeadlinesPage } from "@/pages/deadlines/deadlines.page";
import { SpacesPage } from "@/pages/spaces/spaces.page";

import { PrivateRoot } from "./PrivateRoot.tsx";
import { routesLoaders } from "./loaders.ts";
import { AiHome } from "@/pages/ai/ai-home.tsx";
import { SummariesListPage } from "@/pages/ai/summaries-list.tsx";
import { SummaryViewPage } from "@/pages/ai/summary-view.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        errorElement: <RouterErrorPage />,
        loader: routesLoaders.publicRoot,
        children: [
            // ── Public pages ────────────────────────────────────────────────────────
            {
                index: true,
                element: (
                    <LazyBoundary>
                        <LandingPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "docs",
                element: (
                    <LazyBoundary>
                        <DocsPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "about",
                element: (
                    <LazyBoundary>
                        <AboutPage />
                    </LazyBoundary>
                ),
            },

            // ── Auth (guest-only) ────────────────────────────────────────────────────
            {
                path: "login",
                loader: routesLoaders.guestOnly,
                element: (
                    <LazyBoundary>
                        <LoginPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "register",
                loader: routesLoaders.guestOnly,
                element: (
                    <LazyBoundary>
                        <RegisterPage />
                    </LazyBoundary>
                ),
            },

            // ── Dashboard (protected) ────────────────────────────────────────────────
            {
                element: <PrivateRoot />,
                loader: routesLoaders.privateRoot,
                children: [
                    {
                        path: "dashboard",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Дашборд" },
                                    ]}>
                                        <DashboardPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/settings",
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
                    },
                    {
                        path: "dashboard/organizer/to-do",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "To-Do" },
                                    ]}>
                                        <TodoPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/schedule/calendar",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        fullHeight
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "Розклад" },
                                            { label: "Календар" },
                                        ]}
                                    >
                                        <SchedulePage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/schedule/subjects",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Розклад" },
                                        { label: "Предмети" },
                                    ]}>
                                        <SubjectsPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/schedule/subjects/:id",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Розклад" },
                                        { label: "Предмети", href: "/dashboard/schedule/subjects" },
                                        { label: "Деталі" },
                                    ]}>
                                        <SubjectDetailPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/files",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        fullHeight
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "Файли" },
                                        ]}
                                    >
                                        <FilesPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/chats",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Чати" },
                                    ]}>
                                        <ChatPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/deadlines",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Дедлайни" },
                                    ]}>
                                        <DeadlinesPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/spaces",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Спейси" },
                                    ]}>
                                        <SpacesPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/ai",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "AI-помічник" },
                                        ]}
                                    >
                                        <AiHome />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/ai/summaries",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "AI-помічник", href: "/dashboard/ai" },
                                            { label: "Конспекти" },
                                        ]}
                                    >
                                        <SummariesListPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/ai/summaries/:id",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "AI-помічник", href: "/dashboard/ai" },
                                            { label: "Конспекти", href: "/dashboard/ai/summaries" },
                                            { label: "Перегляд" },
                                        ]}
                                    >
                                        <SummaryViewPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/organizer",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Органайзер" },
                                    ]}>
                                        <PlaceholderPage title="Органайзер" />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/organizer/notes",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Органайзер" },
                                        { label: "Нотатки" },
                                    ]}>
                                        <PlaceholderPage title="Нотатки" />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                ]
            },

            {
                path: "ui-kit-page",
                element: (
                    <LazyBoundary>
                        <UiKitLayout>
                            <UiKitPage />
                        </UiKitLayout>
                    </LazyBoundary>
                ),
            },
        ]
    },
]);
