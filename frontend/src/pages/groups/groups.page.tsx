import { GroupsList } from "@/modules/groups/ui/groups-list";
import usePageTitle from "@/shared/hooks/usePageTitle";

export function GroupsPage() {
    usePageTitle("Групи", { suffix: true });

    return <GroupsList />;
}
