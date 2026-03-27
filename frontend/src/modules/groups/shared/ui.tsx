import { type ReactNode } from "react";
import { ShieldIcon } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { Card, CardContent } from "@/shared/shadcn/ui/card";

import { ROLE_LABELS, type GroupRole } from "./view";

export const groupTextAreaClassName =
    "min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

export function Field({
                          label,
                          children,
                          hint,
                      }: {
    label: string;
    children: ReactNode;
    hint?: string;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {children}
            {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </label>
    );
}

export function EmptyState({
                               title,
                               description,
                               action,
                           }: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <Card className="border-dashed border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="rounded-2xl bg-background/70 p-3 text-muted-foreground">
                    <ShieldIcon className="size-5" />
                </div>
                <div className="space-y-1">
                    <div className="text-base font-semibold text-foreground">{title}</div>
                    <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                {action}
            </CardContent>
        </Card>
    );
}

export function SectionHeader({
                                  eyebrow,
                                  title,
                                  actions,
                                  badges,
                              }: {
    eyebrow: string;
    title: string;
    actions?: ReactNode;
    badges?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        {eyebrow}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h2>
                        {badges}
                    </div>
                </div>
                {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
        </div>
    );
}

export function StatCard({
                             label,
                             value,
                             hint,
                         }: {
    label: string;
    value: string | number;
    hint: string;
}) {
    return (
        <Card className="border-border/70">
            <CardContent className="space-y-2 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                </div>
                <div className="text-2xl font-semibold text-foreground">{value}</div>
                <p className="text-sm text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    );
}

export function RoleBadge({ role }: { role: GroupRole }) {
    return <Badge variant="outline">{ROLE_LABELS[role]}</Badge>;
}
