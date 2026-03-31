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
    { key: "overview",       label: "Огляд",         icon: LayoutDashboardIcon },
    { key: "announcements",  label: "Оголошення",     icon: MegaphoneIcon },
    { key: "chat",           label: "Канали",         icon: MessageSquareIcon },
    { key: "subjects",       label: "Предмети",       icon: BookOpenIcon },
    { key: "schedule",       label: "Розклад",        icon: CalendarDaysIcon },
    { key: "deadlines",      label: "Дедлайни",       icon: ShieldCheckIcon },
    { key: "files",          label: "Файли",          icon: FilesIcon },
    { key: "polls",          label: "Опитування",     icon: VoteIcon },
    { key: "members",        label: "Учасники",       icon: UsersIcon },
    { key: "settings",       label: "Налаштування",   icon: Settings2Icon },
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
            <aside className="flex h-full flex-col overflow-hidden">
                {/* Group identity */}
                <div className="px-4 pb-3 pt-4">
                    {/* Color stripe accent */}
                    <div
                        className="mb-3 h-0.5 w-8 rounded-full"
                        style={{ backgroundColor: group.color ?? "#2563eb" }}
                    />
                    <p className="text-sm font-bold leading-tight tracking-tight">{group.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {group.code}
                        </span>
                        <span className="rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {currentRoleLabel}
                        </span>
                    </div>
                </div>

                <div className="mx-4 h-px bg-border/30" />

                {/* Nav */}
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
                    {GROUP_SIDEBAR_ITEMS.map(({ key, label, icon: Icon }) => {
                        const isActive = currentSection === key;
                        const count = counts[key];

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSection(key)}
                                className={cn(
                                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                                    isActive
                                        ? "bg-primary/8 text-foreground"
                                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "size-4 shrink-0",
                                        isActive ? "text-primary" : "text-muted-foreground/70",
                                    )}
                                />

                                <span className="flex-1 truncate text-sm font-medium">{label}</span>

                                {typeof count === "number" && count > 0 && (
                                    <span
                                        className={cn(
                                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted/60 text-muted-foreground",
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </PageSidePanel>
    );
}
