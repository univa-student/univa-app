import { CheckIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/shared/shadcn/ui/button";
import { cn } from "@/shared/shadcn/lib/utils";
import type { NotificationItem } from "../model/types";
import { getNotificationMeta } from "./notification-meta";
import { getCreatedAt, getReadAt, formatRelativeTime } from "../lib/utils";

interface NotificationCardProps {
    notification: NotificationItem;
    onMarkRead: (id: number) => void;
    onDelete: (id: number) => void;
    isMarkingRead: boolean;
    isDeleting: boolean;
}

export function NotificationCard({
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
