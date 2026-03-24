import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, AlertTriangleIcon } from "lucide-react";
import type { DeadlinePriority } from "@/modules/deadlines/model/types";
import { Badge } from "@/shared/shadcn/ui/badge";

interface Props {
    priority: DeadlinePriority;
}

// eslint-disable-next-line react-refresh/only-export-components
export const priorityConfig: Record<DeadlinePriority, { icon: React.ComponentType<{ className?: string }>, label: string, badgeVariant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
    low: { icon: ArrowDownIcon, label: "Низький", badgeVariant: "secondary", color: "text-muted-foreground" },
    medium: { icon: ArrowRightIcon, label: "Середній", badgeVariant: "outline", color: "text-blue-500 border-blue-500/30" },
    high: { icon: ArrowUpIcon, label: "Високий", badgeVariant: "secondary", color: "text-orange-500 bg-orange-500/10" },
    critical: { icon: AlertTriangleIcon, label: "Критичний", badgeVariant: "destructive", color: "" },
};

export function DeadlinePriorityBadge({ priority }: Props) {
    const config = priorityConfig[priority];
    const Icon = config.icon;

    return (
        <Badge variant={config.badgeVariant} className={`gap-1 pr-2.5 ${config.color}`}>
            <Icon className="size-3" />
            <span>{config.label}</span>
        </Badge>
    );
}
