/* eslint-disable react-refresh/only-export-components */
import React from "react";
import {
    BellIcon,
    CheckCheckIcon,
    BotIcon,
    FileTextIcon,
    UserIcon,
    ImageIcon,
    Loader2Icon,
} from "lucide-react";
import { Button } from "@/shared/shadcn/ui/button";
import { PageSidePanel } from "@/shared/ui/page-side-panel";
import { cn } from "@/shared/shadcn/lib/utils";
import type { NotificationFilter } from "../model/types";

export const SIDEBAR_ITEMS: { key: NotificationFilter; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "Усі", icon: BellIcon },
    { key: "unread", label: "Непрочитані", icon: CheckCheckIcon },
    { key: "ai", label: "AI-конспекти", icon: BotIcon },
    { key: "files", label: "Файли", icon: FileTextIcon },
    { key: "profile", label: "Профіль", icon: UserIcon },
    { key: "avatar", label: "Аватар", icon: ImageIcon },
];

interface NotificationsSidebarProps {
    currentFilter: NotificationFilter;
    setFilter: (f: NotificationFilter) => void;
    stats: Record<NotificationFilter, number>;
    onMarkAllRead: () => void;
    isMarkingAllRead: boolean;
    isLoading: boolean;
}

export function NotificationsSidebar({
    currentFilter,
    setFilter,
    stats,
    onMarkAllRead,
    isMarkingAllRead,
    isLoading,
}: NotificationsSidebarProps) {
    return (
        <PageSidePanel>
            <div className="border-b border-border/60 px-5 py-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <BellIcon className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        Центр сповіщень
                    </span>
                </div>
                <h1 className="mt-3 text-xl font-semibold tracking-tight">Сповіщення</h1>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Фільтрація подій за категоріями.
                </p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {SIDEBAR_ITEMS.map(({ key, label, icon: Icon }) => {
                    const isActive = currentFilter === key;
                    const count = stats[key] || 0;

                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                                isActive
                                    ? "bg-primary/8 text-foreground ring-1 ring-primary/15"
                                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted/70 text-muted-foreground"
                                )}
                            >
                                <Icon className="size-3.5" />
                            </div>
                            <span className="flex-1 truncate text-sm font-medium">{label}</span>
                            {count > 0 && (
                                <span
                                    className={cn(
                                        "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
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
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 rounded-xl text-sm"
                    disabled={isMarkingAllRead || isLoading || (stats.unread || 0) === 0}
                    onClick={onMarkAllRead}
                >
                    {isMarkingAllRead ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                        <CheckCheckIcon className="size-3.5" />
                    )}
                    Позначити все як прочитане
                </Button>
            </div>
        </PageSidePanel>
    );
}
