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
    toast as globalToast,
    dismissToast,
    clearToasts,
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
    }
> = {
    success: {
        icon: CheckCircle2,
        wrapper:
            "border-emerald-500/25 bg-emerald-950/70 shadow-[0_10px_40px_rgba(16,185,129,0.12)]",
        iconWrap: "bg-emerald-500/10 ring-1 ring-emerald-400/20",
        iconColor: "text-emerald-400",
        progress: "bg-emerald-400/80",
    },
    warning: {
        icon: AlertTriangle,
        wrapper:
            "border-amber-500/25 bg-amber-950/70 shadow-[0_10px_40px_rgba(245,158,11,0.12)]",
        iconWrap: "bg-amber-500/10 ring-1 ring-amber-400/20",
        iconColor: "text-amber-400",
        progress: "bg-amber-400/80",
    },
    destructive: {
        icon: XCircle,
        wrapper:
            "border-rose-500/25 bg-rose-950/70 shadow-[0_10px_40px_rgba(244,63,94,0.14)]",
        iconWrap: "bg-rose-500/10 ring-1 ring-rose-400/20",
        iconColor: "text-rose-400",
        progress: "bg-rose-400/80",
    },
    info: {
        icon: Info,
        wrapper:
            "border-sky-500/25 bg-sky-950/70 shadow-[0_10px_40px_rgba(59,130,246,0.12)]",
        iconWrap: "bg-sky-500/10 ring-1 ring-sky-400/20",
        iconColor: "text-sky-400",
        progress: "bg-sky-400/80",
    },
    default: {
        icon: Info,
        wrapper:
            "border-violet-500/25 bg-violet-950/70 shadow-[0_10px_40px_rgba(139,92,246,0.12)]",
        iconWrap: "bg-violet-500/10 ring-1 ring-violet-400/20",
        iconColor: "text-violet-400",
        progress: "bg-violet-400/80",
    },
};

export function AlertContainer() {
    const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

    return (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex w-[380px] max-w-[calc(100vw-24px)] flex-col gap-3">
            <AnimatePresence initial={false}>
                {toasts.map((toast) => {
                    const styles = VARIANT_STYLES[toast.variant];
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
                                "text-zinc-50",
                                styles.wrapper,
                            )}
                        >
                            {/* soft glow layer */}
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]" />

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
                                        <div className="mb-1 text-sm font-semibold tracking-[-0.01em] text-white">
                                            {toast.title}
                                        </div>
                                    )}

                                    <div className="text-[13px] leading-5 text-zinc-300">
                                        {toast.message}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Закрити"
                                    onClick={() => dismissToast(toast.id)}
                                    className={cn(
                                        "absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg",
                                        "border border-white/5 bg-white/5 text-zinc-400 transition",
                                        "hover:bg-white/10 hover:text-zinc-200",
                                        "focus:outline-none focus:ring-2 focus:ring-white/15",
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

// backward compatibility
export function ToastProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function useToast() {
    return {
        toast: globalToast,
        dismiss: dismissToast,
        clear: clearToasts,
    };
}
