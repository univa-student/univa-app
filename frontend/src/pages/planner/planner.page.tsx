import usePageTitle from "@/shared/hooks/usePageTitle";
import { PlannerWorkspace } from "@/modules/planner";

export function PlannerPage() {
    usePageTitle("Планер | Univa", { suffix: true });

    return <PlannerWorkspace />;
}
