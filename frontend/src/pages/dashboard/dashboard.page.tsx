import usePageTitle from "@/shared/hooks/usePageTitle.ts";
import { DashboardOverview } from "@/widgets/dashboard-overview";

export function DashboardPage() {
    usePageTitle("Головна", { suffix: true });

    return <DashboardOverview />;
}