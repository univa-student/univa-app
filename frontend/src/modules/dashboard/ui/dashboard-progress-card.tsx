import { motion } from "framer-motion";
import { HardDriveIcon, TrendingUpIcon } from "lucide-react";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { StorageInfoResponse } from "@/modules/files/model/types";

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
    stats: { all?: number; completed?: number; overdue?: number } | undefined;
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
        <div className="overflow-hidden rounded-[28px] border border-border/50 bg-card shadow-sm">
            {/* Header */}
            <div className="border-b border-border/30 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Прогрес</p>
                <h2 className="text-sm font-semibold">Ресурси і виконання</h2>
            </div>

            <div className="p-4 space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                    </div>
                ) : (
                    <>
                        {/* Deadline progress */}
                        <div className="rounded-2xl border border-border/40 bg-muted/15 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <TrendingUpIcon className="size-3.5" />
                                    Дедлайни
                                </div>
                                {overdue > 0 && (
                                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-500">
                                        {overdue} прострочено
                                    </span>
                                )}
                            </div>
                            <div className="flex items-end justify-between gap-2 mb-3">
                                <p className="text-3xl font-bold tabular-nums leading-none">{progressPct}%</p>
                                <p className="text-xs text-muted-foreground pb-0.5">
                                    {completed} / {total}
                                </p>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        {/* Storage */}
                        {storageInfo && (
                            <div className="rounded-2xl border border-border/40 bg-muted/15 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <HardDriveIcon className="size-3.5" />
                                        Сховище
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                        storagePct > 90 ? "bg-red-500/10 text-red-500" :
                                        storagePct > 70 ? "bg-amber-500/10 text-amber-500" :
                                        "bg-muted text-muted-foreground"
                                    }`}>
                                        {storagePct}%
                                    </span>
                                </div>
                                <p className="mb-3 text-xs text-muted-foreground">
                                    {fmtSize(storageUsed)} з {fmtSize(storageLimit)}
                                </p>
                                <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                                    <motion.div
                                        className={`h-full rounded-full ${
                                            storagePct > 90 ? "bg-red-500" :
                                            storagePct > 70 ? "bg-amber-500" :
                                            "bg-blue-500"
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${storagePct}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
