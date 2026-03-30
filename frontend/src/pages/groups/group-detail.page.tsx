import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { GroupWorkspace } from "@/modules/groups/ui/group-workspace";
import usePageTitle from "@/shared/hooks/usePageTitle";

export function GroupDetailPage() {
    const params = useParams();
    const groupId = useMemo(() => Number(params.groupId), [params.groupId]);

    usePageTitle("Група", { suffix: true });

    if (!Number.isFinite(groupId) || groupId <= 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <h1 className="text-xl font-semibold text-foreground">Некоректний ідентифікатор групи</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Перевірте адресу або поверніться до списку груп.
                </p>
            </div>
        );
    }

    return <GroupWorkspace groupId={groupId} />;
}
