import React, { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Info,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    X,
} from "lucide-react";

import {
    toastStore,
    dismissToast,
    type ToastVariant,
} from "@/shared/lib/toast-store";
import {cn} from "@/shared/shadcn/lib/utils.ts";

export type { ToastVariant, ToastInput, Toast } from "@/shared/lib/toast-store";

const DEFAULT_AUTOCLOSE = 3500;

const VARIANT_STYLES: Record<
ToastVariant,
    {
        icon: React.ComponentType<{ className?: string }>;
        wrapper: string;
        iconWrap: string;
        iconColor: string;
        progress: string;
        title: string;
        description: string;
        closeButton: string;
        glow: string;
    }
    > = {
        success: {
            icon: CheckCircle2,
            wrapper:
                "border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,185,129,0.15),0_0_0_1px_rgba(16,185,129,0.1)] " +
                "dark:border-emerald-500/25 dark:bg-gradient-to-br dark:from-emerald-950/90 dark:to-emerald-900/50 dark:shadow-[0_8px_32px_rgba(16,185,129,0.2),0_0_0_1px_rgba(16,185,129,0.1)]",
            iconWrap:
                "bg-gradient-to-br from-emerald-100 to-emerald-50 ring-1 ring-emerald-200/50 shadow-sm " +
                "dark:from-emerald-500/20 dark:to-emerald-600/10 dark:ring-emerald-400/30 dark:shadow-inner",
            iconColor: "text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
            progress: "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-400/90",
            title: "text-emerald-900 dark:text-emerald-100",
            description: "text-emerald-700/80 dark:text-emerald-300/80",
            closeButton:
                "border-emerald-200/40 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/80 hover:text-emerald-900 focus:ring-emerald-200/50 " +
                "dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-100 dark:focus:ring-emerald-400/30",
            glow: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]",
        },
        warning: {
            icon: AlertTriangle,
            wrapper:
                "border-amber-200/60 bg-gradient-to-br from-white to-amber-50/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(245,158,11,0.15),0_0_0_1px_rgba(245,158,11,0.1)] " +
                "dark:border-amber-500/25 dark:bg-gradient-to-br dark:from-amber-950/90 dark:to-amber-900/50 dark:shadow-[0_8px_32px_rgba(245,158,11,0.2),0_0_0_1px_rgba(245,158,11,0.1)]",
            iconWrap:
                "bg-gradient-to-br from-amber-100 to-amber-50 ring-1 ring-amber-200/50 shadow-sm " +
                "dark:from-amber-500/20 dark:to-amber-600/10 dark:ring-amber-400/30 dark:shadow-inner",
            iconColor: "text-amber-600 dark:text-amber-300 dark:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
            progress: "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-500 dark:to-amber-400/90",
            title: "text-amber-900 dark:text-amber-100",
            description: "text-amber-700/80 dark:text-amber-300/80",
            closeButton:
                "border-amber-200/40 bg-amber-50/50 text-amber-700 hover:bg-amber-100/80 hover:text-amber-900 focus:ring-amber-200/50 " +
                "dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20 dark:hover:text-amber-100 dark:focus:ring-amber-400/30",
            glow: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]",
        },
        destructive: {
            icon: XCircle,
            wrapper:
                "border-rose-200/60 bg-gradient-to-br from-white to-rose-50/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(244,63,94,0.15),0_0_0_1px_rgba(244,63,94,0.1)] " +
                "dark:border-rose-500/25 dark:bg-gradient-to-br dark:from-rose-950/90 dark:to-rose-900/50 dark:shadow-[0_8px_32px_rgba(244,63,94,0.24),0_0_0_1px_rgba(244,63,94,0.1)]",
            iconWrap:
                "bg-gradient-to-br from-rose-100 to-rose-50 ring-1 ring-rose-200/50 shadow-sm " +
                "dark:from-rose-500/20 dark:to-rose-600/10 dark:ring-rose-400/30 dark:shadow-inner",
            iconColor: "text-rose-600 dark:text-rose-300 dark:drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]",
            progress: "bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 dark:from-rose-400 dark:via-rose-500 dark:to-rose-400/90",
            title: "text-rose-900 dark:text-rose-100",
            description: "text-rose-700/80 dark:text-rose-300/80",
            closeButton:
                "border-rose-200/40 bg-rose-50/50 text-rose-700 hover:bg-rose-100/80 hover:text-rose-900 focus:ring-rose-200/50 " +
                "dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-100 dark:focus:ring-rose-400/30",
            glow: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]",
        },
        info: {
            icon: Info,
            wrapper:
                "border-sky-200/60 bg-gradient-to-br from-white to-sky-50/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(59,130,246,0.15),0_0_0_1px_rgba(59,130,246,0.1)] " +
                "dark:border-sky-500/25 dark:bg-gradient-to-br dark:from-sky-950/90 dark:to-sky-900/50 dark:shadow-[0_8px_32px_rgba(59,130,246,0.2),0_0_0_1px_rgba(59,130,246,0.1)]",
            iconWrap:
                "bg-gradient-to-br from-sky-100 to-sky-50 ring-1 ring-sky-200/50 shadow-sm " +
                "dark:from-sky-500/20 dark:to-sky-600/10 dark:ring-sky-400/30 dark:shadow-inner",
            iconColor: "text-sky-600 dark:text-sky-300 dark:drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]",
            progress: "bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 dark:from-sky-400 dark:via-sky-500 dark:to-sky-400/90",
            title: "text-sky-900 dark:text-sky-100",
            description: "text-sky-700/80 dark:text-sky-300/80",
            closeButton:
                "border-sky-200/40 bg-sky-50/50 text-sky-700 hover:bg-sky-100/80 hover:text-sky-900 focus:ring-sky-200/50 " +
                "dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20 dark:hover:text-sky-100 dark:focus:ring-sky-400/30",
            glow: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]",
        },
        default: {
            icon: Info,
            wrapper:
                "border-violet-200/60 bg-gradient-to-br from-white to-violet-50/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(139,92,246,0.15),0_0_0_1px_rgba(139,92,246,0.1)] " +
                "dark:border-violet-500/25 dark:bg-gradient-to-br dark:from-violet-950/90 dark:to-violet-900/50 dark:shadow-[0_8px_32px_rgba(139,92,246,0.2),0_0_0_1px_rgba(139,92,246,0.1)]",
            iconWrap:
                "bg-gradient-to-br from-violet-100 to-violet-50 ring-1 ring-violet-200/50 shadow-sm " +
                "dark:from-violet-500/20 dark:to-violet-600/10 dark:ring-violet-400/30 dark:shadow-inner",
            iconColor: "text-violet-600 dark:text-violet-300 dark:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]",
            progress: "bg-gradient-to-r from-violet-500 via-violet-600 to-violet-500 dark:from-violet-400 dark:via-violet-500 dark:to-violet-400/90",
            title: "text-violet-900 dark:text-violet-100",
            description: "text-violet-700/80 dark:text-violet-300/80",
            closeButton:
                "border-violet-200/40 bg-violet-50/50 text-violet-700 hover:bg-violet-100/80 hover:text-violet-900 focus:ring-violet-200/50 " +
                "dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20 dark:hover:text-violet-100 dark:focus:ring-violet-400/30",
            glow: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]",
        },
    };

export function AlertContainer() {
    const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

    return (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex w-[380px] max-w-[calc(100vw-24px)] flex-col gap-3">
            <AnimatePresence initial={false}>
                {toasts.map((toast) => {
                    const styles = VARIANT_STYLES[toast.variant] ?? VARIANT_STYLES.default;
                    const Icon = styles.icon;
                    const duration = toast.autoCloseMs ?? DEFAULT_AUTOCLOSE;

                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.96 }}
                            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl",
                                styles.wrapper,
                            )}
                        >
                            {/* soft glow layer */}
                            <div className={cn("pointer-events-none absolute inset-0", styles.glow)} />

                            <div className="relative flex items-start gap-3 p-4 pr-11">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                        styles.iconWrap,
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", styles.iconColor)} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    {toast.title && (
                                        <div className={cn("mb-1 text-sm font-semibold tracking-[-0.01em]", styles.title)}>
                                            {toast.title}
                                        </div>
                                    )}

                                    <div className={cn("text-[13px] leading-5", styles.description)}>
                                        {toast.message}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Закрити"
                                    onClick={() => dismissToast(toast.id)}
                                    className={cn(
                                        "absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg transition",
                                        "focus:outline-none focus:ring-2",
                                        styles.closeButton,
                                    )}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <motion.div
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: duration / 1000, ease: "linear" }}
                                className={cn(
                                    "absolute bottom-0 left-0 h-[3px] w-full origin-left",
                                    styles.progress,
                                )}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}