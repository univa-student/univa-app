import React, { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InfoIcon, CheckCircle2, AlertTriangle, XCircle, XIcon } from "lucide-react";
import { toastStore, toast as globalToast, dismissToast, clearToasts, type ToastVariant } from "@/shared/lib/toast-store";

export type { ToastVariant, ToastInput, Toast } from "@/shared/lib/toast-store";

const VARIANT_MAP: Record<ToastVariant, {
    icon: React.FC<{ className?: string; size?: number }>;
    accent: string;
    bg: string;
    glow: string;
}> = {
    success: {
        icon: CheckCircle2,
        accent: "#22c55e",
        bg: "rgba(10, 20, 14, 0.92)",
        glow: "0 0 24px rgba(34,197,94,0.12)",
    },
    warning: {
        icon: AlertTriangle,
        accent: "#f59e0b",
        bg: "rgba(20, 16, 8, 0.92)",
        glow: "0 0 24px rgba(245,158,11,0.12)",
    },
    destructive: {
        icon: XCircle,
        accent: "#ef4444",
        bg: "rgba(20, 10, 10, 0.92)",
        glow: "0 0 24px rgba(239,68,68,0.12)",
    },
    info: {
        icon: InfoIcon,
        accent: "#3b82f6",
        bg: "rgba(10, 14, 22, 0.92)",
        glow: "0 0 24px rgba(59,130,246,0.12)",
    },
    default: {
        icon: InfoIcon,
        accent: "#7c3aed",
        bg: "rgba(14, 10, 22, 0.92)",
        glow: "0 0 24px rgba(124,58,237,0.12)",
    },
};

const DEFAULT_AUTOCLOSE = 3500;

export function AlertContainer() {
    const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

    return (
        <div
            className="lynx-alert-stack"
            style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 9999,
                width: 380,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                pointerEvents: "none",
            }}
        >
            <AnimatePresence initial={false}>
                {toasts.map((t) => {
                    const v = VARIANT_MAP[t.variant];
                    const IconComp = v.icon;
                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            layout
                            style={{
                                pointerEvents: "auto",
                                position: "relative",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                padding: "14px 16px",
                                borderRadius: 14,
                                background: v.bg,
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderLeft: `3px solid ${v.accent}`,
                                boxShadow: `${v.glow}, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
                                color: "#f0f0f5",
                                fontFamily: "Inter, system-ui, sans-serif",
                                overflow: "hidden",
                            }}
                        >
                            {/* Accent icon */}
                            <div style={{
                                flexShrink: 0,
                                marginTop: 1,
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: `${v.accent}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <span style={{ color: v.accent }}>
                                    <IconComp size={15} />
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {t.title && (
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: 13,
                                        letterSpacing: "-0.01em",
                                        marginBottom: 2,
                                        color: "rgba(255,255,255,0.95)",
                                    }}>
                                        {t.title}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: 12.5,
                                    lineHeight: 1.5,
                                    color: "rgba(255,255,255,0.6)",
                                }}>
                                    {t.message}
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => dismissToast(t.id)}
                                aria-label="Закрити"
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    border: "none",
                                    background: "rgba(255,255,255,0.06)",
                                    color: "rgba(255,255,255,0.4)",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                                }}
                            >
                                <XIcon size={12} />
                            </button>

                            {/* Bottom progress bar */}
                            <motion.div
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: (t.autoCloseMs ?? DEFAULT_AUTOCLOSE) / 1000, ease: "linear" }}
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 2,
                                    background: v.accent,
                                    opacity: 0.5,
                                    transformOrigin: "left",
                                    borderBottomLeftRadius: 14,
                                    borderBottomRightRadius: 14,
                                }}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// Deprecated Provider, keeping it for backwards compatibility of imports
export function ToastProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function useToast() {
    return {
        toast: globalToast,
        dismiss: dismissToast,
        clear: clearToasts
    };
}
