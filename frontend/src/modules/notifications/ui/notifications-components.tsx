import { InboxIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/shared/shadcn/lib/utils";
import type { NotificationFilter } from "../model/types";

export function SkeletonCard() {
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

export function EmptyState({ filter }: { filter: NotificationFilter }) {
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

export function StatPill({
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
