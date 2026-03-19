import usePageTitle from "@/shared/hooks/usePageTitle.ts";
import { DashboardOverview } from "@/modules/dashboard/ui";

export function DashboardPage() {
    usePageTitle("Головна", { suffix: true });

    return <DashboardOverview />;
}