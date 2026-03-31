import { createBrowserRouter } from "react-router-dom";

import { LazyBoundary } from "@/shared/ui/lazy-boundary";
import { RouterErrorPage } from "@/shared/ui/error-boudary/router-error-boundary.tsx";
import { DashboardPage } from "@/pages/dashboard/dashboard.page.tsx";
import { LandingPage } from "@/landing/pages/landing.page.tsx";
import { DocsPage } from "@/landing/pages/docs.page.tsx";
import { AboutPage } from "@/landing/pages/about.page.tsx";
import { SettingsPage } from "@/pages/settings/settings.page.tsx";
import { ProfilePage } from "@/pages/profile/profile.page.tsx";
import { DashboardLayout } from "@/shared/ui/layouts/app/dashboard.layout.tsx";
import { LoginPage } from "@/pages/auth/login.page.tsx";
import { RegisterPage } from "@/pages/auth/register.page.tsx";
import { AuthGuard } from "@/app/router/guards/auth-guard.tsx";
import { SubjectsPage } from "@/pages/subjects/subjects.page";
import { SubjectDetailPage } from "@/pages/subjects/subject-detail.page";
import { OrganizerPage } from "@/pages/dashboard/organizer/organizer.page.tsx";
import { OrganizerNotesPage } from "@/pages/dashboard/organizer/notes.page.tsx";
import { TodoPage } from "@/pages/dashboard/organizer/todo.page.tsx";
import { SchedulePage } from "@/pages/schedule/schedule.page.tsx";
import { FilesPage } from "@/pages/files/files.page";
import { ChatPage } from "@/pages/chat/chat.page";
import { DeadlinesPage } from "@/pages/deadlines/deadlines.page";
import { GroupsPage } from "@/pages/groups/groups.page";
import { GroupDetailPage } from "@/pages/groups/group-detail.page";
import { NotificationsPage } from "@/pages/notifications/notifications.page";
import { FriendsPage } from "@/pages/friends/friends.page.tsx";
import { CommunityPage } from "@/pages/community/community.page.tsx";

import { PrivateRoot } from "./PrivateRoot.tsx";
import { routesLoaders } from "./loaders.ts";
import { AiHome } from "@/pages/ai/ai-home.tsx";
import { SummariesListPage } from "@/pages/ai/summaries-list.tsx";
import { SummaryViewPage } from "@/pages/ai/summary-view.tsx";
import {IntegrationsPage} from "@/landing/pages/integrations.page.tsx";
import {StatusPage} from "@/landing/pages/status.page.tsx";
import {ApiPage} from "@/landing/pages/api.page.tsx";
import {SupportPage} from "@/landing/pages/support.page.tsx";
import {CookiesPage, LicensesPage, PrivacyPage, TermsPage} from "@/landing/pages/licenses.page.tsx";
import {BlogPage, CareerPage, ContactPage} from "@/landing/pages/blog.page.tsx";

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
            {
                path: "integrations",
                element: (
                    <LazyBoundary>
                        <IntegrationsPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "status",
                element: (
                    <LazyBoundary>
                        <StatusPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "api",
                element: (
                    <LazyBoundary>
                        <ApiPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "support",
                element: (
                    <LazyBoundary>
                        <SupportPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "privacy",
                element: (
                    <LazyBoundary>
                        <PrivacyPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "terms",
                element: (
                    <LazyBoundary>
                        <TermsPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "cookies",
                element: (
                    <LazyBoundary>
                        <CookiesPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "licenses",
                element: (
                    <LazyBoundary>
                        <LicensesPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "contacts",
                element: (
                    <LazyBoundary>
                        <ContactPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "career",
                element: (
                    <LazyBoundary>
                        <CareerPage />
                    </LazyBoundary>
                ),
            },
            {
                path: "blog",
                element: (
                    <LazyBoundary>
                        <BlogPage />
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
                        path: "dashboard/profile",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Мій профіль" },
                                    ]}>
                                        <ProfilePage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/profile/:username",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Профіль студента" },
                                    ]}>
                                        <ProfilePage />
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
                        path: "dashboard/groups",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Групи" },
                                    ]}>
                                        <GroupsPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/groups/:groupId",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "Групи", href: "/dashboard/groups" },
                                            { label: "Робочий простір" },
                                        ]}
                                    >
                                        <GroupDetailPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/notifications",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout breadcrumbs={[
                                        { label: "Головна", href: "/dashboard" },
                                        { label: "Сповіщення" },
                                    ]}>
                                        <NotificationsPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                    {
                        path: "dashboard/community",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "Спільнота" },
                                        ]}
                                    >
                                        <CommunityPage />
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
                        path: "dashboard/friends",
                        element: (
                            <LazyBoundary>
                                <AuthGuard>
                                    <DashboardLayout
                                        breadcrumbs={[
                                            { label: "Головна", href: "/dashboard" },
                                            { label: "Друзі" },
                                        ]}
                                    >
                                        <FriendsPage />
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
                                        <OrganizerPage />
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
                                        <OrganizerNotesPage />
                                    </DashboardLayout>
                                </AuthGuard>
                            </LazyBoundary>
                        ),
                    },
                ]
            },
        ]
    },
]);
