/**
 * widgets/app-shell/index.tsx
 *
 * AppShell — the main application layout wrapper (sidebar + header + content).
 * Re-exports DashboardLayout so the "app-shell" widget is the canonical
 * reference per the README, while the underlying layout lives in widgets/layouts.
 */
export { DashboardLayout as AppShell } from "@/widgets/layouts/app/dashboard.layout";
