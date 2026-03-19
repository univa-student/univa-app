import usePageTitle from "@/shared/hooks/usePageTitle.ts";
import { ScheduleCalendar } from "@/modules/schedule/ui/schedule-calendar";

export function SchedulePage() {
    usePageTitle("Розклад", { suffix: true });

    return <ScheduleCalendar />;
}
