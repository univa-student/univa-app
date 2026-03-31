import usePageTitle from "@/shared/hooks/usePageTitle";
import { TaskKanban } from "@/modules/organizer/ui/task-kanban";

export function TodoPage() {
    usePageTitle("To-do | Univa", { suffix: true });

    return <TaskKanban />;
}
