import type { ElementType } from "react";
import {
    BookOpenIcon,
    CalendarDaysIcon,
    FilesIcon,
    LayoutDashboardIcon,
    MegaphoneIcon,
    MessageSquareIcon,
    Settings2Icon,
    ShieldCheckIcon,
    UsersIcon,
    VoteIcon,
} from "lucide-react";

import type { Group } from "@/modules/groups/model/types";
import { Badge } from "@/shared/shadcn/ui/badge";
import { cn } from "@/shared/shadcn/lib/utils";
import { PageSidePanel } from "@/shared/ui/page-side-panel";

export type GroupSection =
    | "overview"
    | "announcements"
    | "chat"
    | "subjects"
    | "schedule"
    | "deadlines"
    | "files"
    | "polls"
    | "members"
    | "settings";

export const DEFAULT_GROUP_SECTION: GroupSection = "overview";

// eslint-disable-next-line react-refresh/only-export-components
export const GROUP_SECTION_LABELS: Record<GroupSection, string> = {
    overview: "Огляд",
    announcements: "Оголошення",
    chat: "Канали",
    subjects: "Предмети",
    schedule: "Розклад",
    deadlines: "Дедлайни",
    files: "Файли",
    polls: "Опитування",
    members: "Учасники",
    settings: "Налаштування",
};

const GROUP_SIDEBAR_ITEMS: Array<{
    key: GroupSection;
    label: string;
    icon: ElementType;
}> = [
    { key: "overview", label: "Огляд", icon: LayoutDashboardIcon },
    { key: "announcements", label: "Оголошення", icon: MegaphoneIcon },
    { key: "chat", label: "Канали", icon: MessageSquareIcon },
    { key: "subjects", label: "Предмети", icon: BookOpenIcon },
    { key: "schedule", label: "Розклад", icon: CalendarDaysIcon },
    { key: "deadlines", label: "Дедлайни", icon: ShieldCheckIcon },
    { key: "files", label: "Файли", icon: FilesIcon },
    { key: "polls", label: "Опитування", icon: VoteIcon },
    { key: "members", label: "Учасники", icon: UsersIcon },
    { key: "settings", label: "Налаштування", icon: Settings2Icon },
];

interface GroupsSidebarProps {
    group: Group;
    currentSection: GroupSection;
    setSection: (section: GroupSection) => void;
    currentRoleLabel: string;
    counts: Partial<Record<GroupSection, number>>;
}

export function GroupsSidebar({
    group,
    currentSection,
    setSection,
    currentRoleLabel,
    counts,
}: GroupsSidebarProps) {
    return (
        <PageSidePanel>
            <aside className="flex h-full flex-col overflow-hidden border-l border-border/70 bg-card">
                <div className="border-b border-border/70 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: group.color ?? "#2563eb" }}
                        />
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            {group.name}
                        </h1>
                    </div>

                    <div className="mt-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{group.code}</Badge>
                            <Badge variant="outline">{currentRoleLabel}</Badge>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                    {GROUP_SIDEBAR_ITEMS.map(({ key, label, icon: Icon }) => {
                        const isActive = currentSection === key;
                        const count = counts[key];

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSection(key)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors",
                                    isActive
                                        ? "bg-primary/8 text-foreground ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-7 items-center justify-center rounded-xl",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted/70 text-muted-foreground",
                                    )}
                                >
                                    <Icon className="size-4" />
                                </div>

                                <span className="flex-1 truncate text-sm font-medium">
                                    {label}
                                </span>

                                {typeof count === "number" ? (
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {count}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </PageSidePanel>
    );
}
