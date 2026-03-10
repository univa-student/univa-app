import usePageTitle from "@/shared/hooks/usePageTitle.ts";
import { ScheduleCalendar } from "@/widgets/schedule-calendar";

export function SchedulePage() {
    usePageTitle("Розклад", { suffix: true });

    return <ScheduleCalendar />;
}
