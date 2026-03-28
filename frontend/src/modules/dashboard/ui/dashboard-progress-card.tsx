import { motion } from "framer-motion";
import { HardDriveIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/ui/card";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { StorageInfoResponse } from "@/modules/files/model/types";
import { DashboardSectionHeading } from "./dashboard-section-heading";

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
}

export function DashboardProgressCard({
    stats,
    storageInfo,
    isLoading,
}: {
    stats: {
        all?: number;
        completed?: number;
        overdue?: number;
    } | undefined;
    storageInfo: StorageInfoResponse | undefined;
    isLoading: boolean;
}) {
    const total = stats?.all ?? 0;
    const completed = stats?.completed ?? 0;
    const overdue = stats?.overdue ?? 0;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const storageUsed = storageInfo?.used ?? 0;
    const storageLimit = Math.max(storageInfo?.limit ?? 1, 1);
    const storagePct = Math.round((storageUsed / storageLimit) * 100);

    return (
        <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
                <DashboardSectionHeading
                    eyebrow="Прогрес"
                    title="Ресурси і виконання"
                    description="Швидкий зріз по дедлайнах і сховищу."
                />
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-28 rounded-3xl" />
                        <Skeleton className="h-24 rounded-3xl" />
                    </div>
                ) : (
                    <>
                        <div className="rounded-[28px] border border-border/70 bg-muted/25 p-5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUpIcon className="size-4" />
                                Загальний прогрес
                            </div>
                            <div className="mt-3 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-3xl font-semibold text-foreground">{progressPct}%</p>
                                    <p className="text-sm text-muted-foreground">
                                        {completed} із {total} завершено
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-background px-3 py-2 text-right">
                                    <p className="text-xs text-muted-foreground">Прострочено</p>
                                    <p className="text-lg font-semibold text-red-500">{overdue}</p>
                                </div>
                            </div>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        {storageInfo ? (
                            <div className="rounded-[28px] border border-border/70 bg-background p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10">
                                        <HardDriveIcon className="size-5 text-blue-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">Сховище</p>
                                        <p className="text-sm text-muted-foreground">
                                            {fmtSize(storageUsed)} із {fmtSize(storageLimit)} використано
                                        </p>
                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                                            <motion.div
                                                className={`h-full rounded-full ${storagePct > 90 ? "bg-red-500" : storagePct > 70 ? "bg-amber-500" : "bg-blue-500"}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${storagePct}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                    <div className="shrink-0 rounded-2xl bg-muted/60 px-3 py-2 text-sm font-semibold text-foreground">
                                        {storagePct}%
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
