import type { ReactNode } from "react";

export function DashboardSectionHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
                {eyebrow ? (
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {eyebrow}
                    </p>
                ) : null}
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
                    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
                </div>
            </div>
            {action}
        </div>
    );
}
