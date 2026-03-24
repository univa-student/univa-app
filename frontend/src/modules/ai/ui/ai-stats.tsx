import React from "react";
import { Loader2 } from "lucide-react";

interface AiStatsProps {
    summaryCount: number;
    isLoading: boolean;
}

export function AiStats({ summaryCount, isLoading }: AiStatsProps) {
    return (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Конспекти</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                    {isLoading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : summaryCount}
                </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Пояснення</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">—</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Тести</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">—</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Документи</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">—</p>
            </div>
        </div>
    );
}
