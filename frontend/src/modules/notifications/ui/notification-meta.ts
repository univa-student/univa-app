import { BellIcon, BotIcon, FileTextIcon, ImageIcon, UserIcon } from "lucide-react";
import type { NotificationMeta } from "@/modules/notifications/model/types";

export type { NotificationMeta };

export function getNotificationMeta(type: string): NotificationMeta {
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
