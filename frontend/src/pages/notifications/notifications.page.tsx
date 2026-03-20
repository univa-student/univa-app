import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
    BellIcon,
    BotIcon,
    CheckCheckIcon,
    CheckIcon,
    FileTextIcon,
    ImageIcon,
    Loader2Icon,
    Trash2Icon,
    UserIcon,
    InboxIcon,
    SparklesIcon,
} from "lucide-react";

import {
    useNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
} from "@/entities/notification/api/hooks";

import { Button } from "@/shared/shadcn/ui/button";
import { ScrollArea } from "@/shared/shadcn/ui/scroll-area";
import { cn } from "@/shared/shadcn/lib/utils";
import { PageSidePanel } from "@/shared/ui/page-side-panel.tsx";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationFilter = "all" | "unread" | "ai" | "files" | "profile" | "avatar";

type NotificationItem = {
    id: number;
    type: string;
    payload?: Record<string, any> | null;
    created_at?: string;
    createdAt?: string;
    read_at?: string | null;
    readAt?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCreatedAt(n: NotificationItem) {
    return n.created_at ?? n.createdAt ?? "";
}

function getReadAt(n: NotificationItem) {
    return n.read_at ?? n.readAt ?? null;
}

/**
 * Returns relative time like "5 хв тому", "2 год тому", "вчора"
 * or falls back to a formatted date string.
 */
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "щойно";
    if (diffMin < 60) return `${diffMin} хв тому`;
    if (diffHour < 24) return `${diffHour} год тому`;
    if (diffDay === 1) return "вчора";
    if (diffDay < 7) return `${diffDay} дн тому`;

    return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "short",
        year: diffDay > 365 ? "numeric" : undefined,
    });
}

function formatDateLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today.getTime() - itemDate.getTime()) / 86_400_000);

    if (diffDays === 0) return "Сьогодні";
    if (diffDays === 1) return "Вчора";
    return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Notification meta ───────────────────────────────────────────────────────

type NotificationMeta = {
    title: string;
    icon: React.ElementType;
    badgeClass: string;
    iconClass: string;
    dotClass: string;
};

function getNotificationMeta(type: string): NotificationMeta {
    switch (type) {
        case "ai_summary_created":
            return {
                title: "AI-конспект",
                icon: BotIcon,
                badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
                dotClass: "bg-emerald-500",
            };
        case "file_uploaded":
            return {
                title: "Файл завантажено",
                icon: FileTextIcon,
                badgeClass: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20",
                dotClass: "bg-blue-500",
            };
        case "profile_updated":
            return {
                title: "Профіль оновлено",
                icon: UserIcon,
                badgeClass: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
                iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20",
                dotClass: "bg-violet-500",
            };
        case "avatar_updated":
            return {
                title: "Аватар оновлено",
                icon: ImageIcon,
                badgeClass: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
                dotClass: "bg-amber-500",
            };
        default:
            return {
                title: "Системне",
                icon: BellIcon,
                badgeClass: "border-border bg-muted text-muted-foreground",
                iconClass: "bg-muted text-muted-foreground ring-1 ring-border",
                dotClass: "bg-muted-foreground",
            };
    }
}

function matchesFilter(n: NotificationItem, filter: NotificationFilter): boolean {
    if (filter === "all") return true;
    if (filter === "unread") return !getReadAt(n);
    if (filter === "ai") return n.type.startsWith("ai_");
    if (filter === "files") return n.type.includes("file");
    if (filter === "profile") return n.type === "profile_updated";
    if (filter === "avatar") return n.type === "avatar_updated";
    return true;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex gap-4">
                <div className="size-11 shrink-0 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2 pt-0.5">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-24 rounded-full bg-muted" />
                        <div className="h-4 w-16 rounded-full bg-muted/60" />
                    </div>
                    <div className="h-3.5 w-3/4 rounded-full bg-muted/70" />
                    <div className="h-3 w-1/3 rounded-full bg-muted/50" />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ filter }: { filter: NotificationFilter }) {
    const messages: Record<NotificationFilter, { heading: string; sub: string }> = {
        all: { heading: "Немає сповіщень", sub: "Усі події з'являться тут, коли відбудуться." },
        unread: { heading: "Все прочитано 🎉", sub: "Ви в курсі всього. Чудова робота!" },
        ai: { heading: "Немає AI-конспектів", sub: "Конспекти з'являться після обробки файлів." },
        files: { heading: "Немає подій з файлами", sub: "Після завантаження файл ви побачите їх тут." },
        profile: { heading: "Профіль не змінювався", sub: "Зміни профілю відображатимуться тут." },
        avatar: { heading: "Аватар не змінювався", sub: "Оновіть аватар, і подія з'явиться тут." },
    };

    const { heading, sub } = messages[filter];

    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 px-6 py-20 text-center">
            <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted">
                <InboxIcon className="size-7 text-muted-foreground" />
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-background ring-2 ring-background">
                    <SparklesIcon className="size-3 text-muted-foreground" />
                </span>
            </div>
            <h3 className="text-base font-semibold text-foreground">{heading}</h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">{sub}</p>
        </div>
    );
}

// ─── Notification card ────────────────────────────────────────────────────────

interface NotificationCardProps {
    notification: NotificationItem;
    onMarkRead: (id: number) => void;
    onDelete: (id: number) => void;
    isMarkingRead: boolean;
    isDeleting: boolean;
}

function NotificationCard({
                              notification,
                              onMarkRead,
                              onDelete,
                              isMarkingRead,
                              isDeleting,
                          }: NotificationCardProps) {
    const meta = getNotificationMeta(notification.type);
    const Icon = meta.icon;
    const createdAt = getCreatedAt(notification);
    const isUnread = !getReadAt(notification);

    return (
        <article
            className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200",
                isUnread
                    ? "border-primary/15 bg-primary/[0.03] shadow-sm hover:shadow-md hover:border-primary/25"
                    : "border-border/50 bg-card hover:border-border/80 hover:shadow-sm",
                (isMarkingRead || isDeleting) && "opacity-50 pointer-events-none"
            )}
        >
            {/* Unread left-border accent */}
            {isUnread && (
                <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-primary/60" />
            )}

            <div className="flex gap-3.5">
                {/* Icon */}
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", meta.iconClass)}>
                    <Icon className="size-4.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        {/* Left side */}
                        <div className="min-w-0">
                            {/* Title row */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-semibold leading-none text-foreground">
                                    {meta.title}
                                </span>
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none tracking-wide",
                                        meta.badgeClass
                                    )}
                                >
                                    {notification.type}
                                </span>
                                {isUnread && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                                        <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
                                        Нове
                                    </span>
                                )}
                            </div>

                            {/* Message */}
                            <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                                {notification.payload?.message ?? "Нове сповіщення від системи"}
                            </p>

                            {/* Timestamp */}
                            <time
                                dateTime={createdAt}
                                className="mt-2 block text-xs text-muted-foreground"
                                title={new Date(createdAt).toLocaleString("uk-UA")}
                            >
                                {formatRelativeTime(createdAt)}
                            </time>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            {isUnread && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                                    onClick={() => onMarkRead(notification.id)}
                                    disabled={isMarkingRead}
                                    title="Позначити як прочитане"
                                >
                                    {isMarkingRead ? (
                                        <Loader2Icon className="size-3.5 animate-spin" />
                                    ) : (
                                        <CheckIcon className="size-3.5" />
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(notification.id)}
                                disabled={isDeleting}
                                title="Видалити"
                            >
                                {isDeleting ? (
                                    <Loader2Icon className="size-3.5 animate-spin" />
                                ) : (
                                    <Trash2Icon className="size-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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

    const sidebarItems: { key: NotificationFilter; label: string; icon: React.ElementType }[] = [
        { key: "all", label: "Усі", icon: BellIcon },
        { key: "unread", label: "Непрочитані", icon: CheckCheckIcon },
        { key: "ai", label: "AI-конспекти", icon: BotIcon },
        { key: "files", label: "Файли", icon: FileTextIcon },
        { key: "profile", label: "Профіль", icon: UserIcon },
        { key: "avatar", label: "Аватар", icon: ImageIcon },
    ];

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
        sidebarItems.find((i) => i.key === currentFilter)?.label ?? "Сповіщення";

    return (
        <div className="flex h-full min-h-0">
            {/* ── Sidebar ── */}
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
                    {sidebarItems.map(({ key, label, icon: Icon }) => {
                        const isActive = currentFilter === key;
                        const count = stats[key];

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
                        disabled={markAllAsRead.isPending || isLoading || stats.unread === 0}
                        onClick={() => markAllAsRead.mutate()}
                    >
                        {markAllAsRead.isPending ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                            <CheckCheckIcon className="size-3.5" />
                        )}
                        Позначити все як прочитане
                    </Button>
                </div>
            </PageSidePanel>

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

// ─── Utility components ───────────────────────────────────────────────────────

function StatPill({
                      label,
                      value,
                      highlight = false,
                  }: {
    label: string;
    value: number;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border px-3.5 py-2.5 transition-colors",
                highlight
                    ? "border-primary/20 bg-primary/5"
                    : "border-border/60 bg-card"
            )}
        >
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {label}
            </div>
            <div
                className={cn(
                    "mt-0.5 text-xl font-semibold tabular-nums",
                    highlight && "text-primary"
                )}
            >
                {value}
            </div>
        </div>
    );
}

function pluralRecords(n: number): string {
    if (n % 10 === 1 && n % 100 !== 11) return "запис";
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "записи";
    return "записів";
}