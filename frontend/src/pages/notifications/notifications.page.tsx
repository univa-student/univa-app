import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";

import {
    useNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
} from "@/modules/notifications/api/hooks";

import { ScrollArea } from "@/shared/shadcn/ui/scroll-area";
import { Button } from "@/shared/shadcn/ui/button";

import type { NotificationFilter, NotificationItem } from "@/modules/notifications/model/types";
import {
    getCreatedAt,
    getReadAt,
    formatDateLabel,
    matchesFilter,
    pluralRecords,
} from "@/modules/notifications/lib/utils";
import {
    NotificationCard,
    NotificationsSidebar,
    SkeletonCard,
    EmptyState,
    StatPill,
    SIDEBAR_ITEMS,
} from "@/modules/notifications/ui";

export function NotificationsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentFilter = (searchParams.get("filter") as NotificationFilter) || "all";

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications();

    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();
    const deleteMutation = useDeleteNotification();

    const notifications = useMemo<NotificationItem[]>(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data]
    );

    const stats = useMemo(
        () => ({
            all: notifications.length,
            unread: notifications.filter((n) => !getReadAt(n)).length,
            ai: notifications.filter((n) => n.type.startsWith("ai_")).length,
            files: notifications.filter((n) => n.type.includes("file")).length,
            profile: notifications.filter((n) => n.type === "profile_updated").length,
            avatar: notifications.filter((n) => n.type === "avatar_updated").length,
        }),
        [notifications]
    );

    const filteredNotifications = useMemo(
        () => notifications.filter((n) => matchesFilter(n, currentFilter)),
        [notifications, currentFilter]
    );

    const groupedNotifications = useMemo(() => {
        const groups = new Map<string, NotificationItem[]>();
        for (const n of filteredNotifications) {
            const label = formatDateLabel(getCreatedAt(n));
            const arr = groups.get(label) ?? [];
            arr.push(n);
            groups.set(label, arr);
        }
        return Array.from(groups.entries());
    }, [filteredNotifications]);

    const setFilter = useCallback(
        (filter: NotificationFilter) => setSearchParams({ filter }),
        [setSearchParams]
    );

    const currentLabel =
        SIDEBAR_ITEMS.find((i) => i.key === currentFilter)?.label ?? "Сповіщення";

    return (
        <div className="flex h-full min-h-0">
            {/* ── Sidebar ── */}
            <NotificationsSidebar
                currentFilter={currentFilter}
                setFilter={setFilter}
                stats={stats as Record<NotificationFilter, number>}
                onMarkAllRead={() => markAllAsRead.mutate()}
                isMarkingAllRead={markAllAsRead.isPending}
                isLoading={isLoading}
            />

            {/* ── Main content ── */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Header */}
                <div className="border-b border-border/60 px-4 py-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                {currentLabel}
                            </p>
                            <h2 className="mt-0.5 text-2xl font-semibold tracking-tight">
                                {currentLabel}
                            </h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {isLoading
                                    ? "Завантаження…"
                                    : `${filteredNotifications.length} ${pluralRecords(filteredNotifications.length)} у цій категорії`}
                            </p>
                        </div>

                        {/* Stats pills */}
                        <div className="hidden gap-2 sm:flex">
                            <StatPill label="Усього" value={stats.all} />
                            <StatPill
                                label="Непрочитані"
                                value={stats.unread}
                                highlight={stats.unread > 0}
                            />
                        </div>
                    </div>
                </div>

                {/* List */}
                <ScrollArea className="flex-1">
                    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 lg:px-8">
                        {/* Skeleton */}
                        {isLoading && (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        )}

                        {/* Empty */}
                        {!isLoading && filteredNotifications.length === 0 && (
                            <EmptyState filter={currentFilter} />
                        )}

                        {/* Notifications */}
                        {!isLoading && filteredNotifications.length > 0 && (
                            <div className="space-y-8">
                                {groupedNotifications.map(([groupLabel, items]) => (
                                    <section key={groupLabel} className="space-y-2">
                                        {/* Date group header */}
                                        <div className="sticky top-0 z-10 -mx-1 px-1 py-1 backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                    {groupLabel}
                                                </span>
                                                <div className="h-px flex-1 bg-border/50" />
                                                <span className="text-[10px] text-muted-foreground/60">
                                                    {items.length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Cards */}
                                        <div className="space-y-2">
                                            {items.map((notification) => (
                                                <NotificationCard
                                                    key={notification.id}
                                                    notification={notification}
                                                    onMarkRead={(id) => markAsRead.mutate(id)}
                                                    onDelete={(id) => deleteMutation.mutate(id)}
                                                    isMarkingRead={
                                                        markAsRead.isPending &&
                                                        markAsRead.variables === notification.id
                                                    }
                                                    isDeleting={
                                                        deleteMutation.isPending &&
                                                        deleteMutation.variables === notification.id
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </section>
                                ))}

                                {/* Load more */}
                                {hasNextPage && (
                                    <div className="flex justify-center pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="min-w-36 rounded-full gap-2"
                                        >
                                            {isFetchingNextPage && (
                                                <Loader2Icon className="size-3.5 animate-spin" />
                                            )}
                                            Завантажити ще
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}