import type { NotificationItem, NotificationFilter } from "../model/types";

export function getCreatedAt(n: NotificationItem) {
    return n.created_at ?? n.createdAt ?? "";
}

export function getReadAt(n: NotificationItem) {
    return n.read_at ?? n.readAt ?? null;
}

export function formatRelativeTime(dateString: string): string {
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

export function formatDateLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today.getTime() - itemDate.getTime()) / 86_400_000);

    if (diffDays === 0) return "Сьогодні";
    if (diffDays === 1) return "Вчора";
    return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });
}

export function matchesFilter(n: NotificationItem, filter: NotificationFilter): boolean {
    if (filter === "all") return true;
    if (filter === "unread") return !getReadAt(n);
    if (filter === "ai") return n.type.startsWith("ai_");
    if (filter === "files") return n.type.includes("file");
    if (filter === "profile") return n.type === "profile_updated";
    if (filter === "avatar") return n.type === "avatar_updated";
    return true;
}

export function pluralRecords(n: number): string {
    if (n % 10 === 1 && n % 100 !== 11) return "запис";
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "записи";
    return "записів";
}
