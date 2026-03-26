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
            <div className="flex h-full flex-col overflow-hidden">
                <div className="border-b border-border/60 px-5 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: group.color ?? "#2563eb" }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            Груповий workspace
                        </span>
                    </div>
                    <h1 className="mt-3 text-xl font-semibold tracking-tight">{group.name}</h1>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {group.description || "Спільний академічний простір групи."}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
                            <div className="text-muted-foreground">Код</div>
                            <div className="mt-1 font-semibold text-foreground">{group.code}</div>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
                            <div className="text-muted-foreground">Роль</div>
                            <div className="mt-1 font-semibold text-foreground">{currentRoleLabel}</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {GROUP_SIDEBAR_ITEMS.map(({ key, label, icon: Icon }) => {
                        const isActive = currentSection === key;
                        const count = counts[key];

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSection(key)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                                    isActive
                                        ? "bg-primary/8 text-foreground ring-1 ring-primary/15"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted/70 text-muted-foreground",
                                    )}
                                >
                                    <Icon className="size-3.5" />
                                </div>

                                <span className="flex-1 truncate text-sm font-medium">{label}</span>

                                {typeof count === "number" && (
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
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-border/60 px-4 py-4">
                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm">
                        <div className="font-medium text-foreground">Як користуватись групою</div>
                        <p className="mt-1 text-muted-foreground">
                            Почніть з предметів, потім додайте розклад, дедлайни, файли й лише після цього розішліть інвайти.
                        </p>
                    </div>
                </div>
            </div>
        </PageSidePanel>
    );
}
