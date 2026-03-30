import usePageTitle from "@/shared/hooks/usePageTitle";
import { DeadlinesTabs } from "@/modules/deadlines/ui/deadlines-tabs";

export function DeadlinesPage() {
    usePageTitle("Дедлайни | Univa", { suffix: true });
    return <DeadlinesTabs />;
}
