import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/shared/shadcn/ui/alert";
import { InfoIcon, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export type ToastVariant = "default" | "info" | "success" | "warning" | "destructive";

export type ToastInput = {
    variant: ToastVariant;
    title?: string;
    message: string;
    autoCloseMs?: number; // напр 2500
};

export type Toast = ToastInput & {
    id: string;
};

type ToastContextValue = {
    toast: (data: ToastInput) => string; // повертає id
    dismiss: (id: string) => void;
    clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getIcon(variant: ToastVariant) {
    switch (variant) {
        case "success":
            return <CheckCircle2 />;
        case "warning":
            return <AlertTriangle />;
        case "destructive":
            return <XCircle />;
        case "info":
        default:
            return <InfoIcon />;
    }
}

const MAX_TOASTS = 6;
const DEFAULT_AUTOCLOSE = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, number>>(new Map());

    const dismiss = useCallback((id: string) => {
        const t = timersRef.current.get(id);
        if (t) window.clearTimeout(t);
        timersRef.current.delete(id);

        setToasts((prev) => prev.filter((x) => x.id !== id));
    }, []);

    const clear = useCallback(() => {
        timersRef.current.forEach((t) => window.clearTimeout(t));
        timersRef.current.clear();
        setToasts([]);
    }, []);

    const toast = useCallback(
        (data: ToastInput) => {
            const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const next: Toast = { id, ...data };

            setToasts((prev) => {
                const merged = [...prev, next];
                return merged.slice(-MAX_TOASTS);
            });

            const ms = data.autoCloseMs ?? DEFAULT_AUTOCLOSE;
            if (ms > 0) {
                const timer = window.setTimeout(() => dismiss(id), ms);
                timersRef.current.set(id, timer);
            }

            return id;
        },
        [dismiss]
    );

    const value = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* контейнер тостів */}
            <div className="fixed right-4 bottom-4 z-50 w-[360px] space-y-2">
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: -12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            layout
                        >
                            <Alert variant={t.variant} className="relative pr-10 shadow-sm">
                                {getIcon(t.variant)}
                                {t.title ? <AlertTitle>{t.title}</AlertTitle> : null}
                                <AlertDescription>{t.message}</AlertDescription>

                                <button
                                    type="button"
                                    onClick={() => dismiss(t.id)}
                                    className="absolute right-3 top-3 text-sm opacity-70 hover:opacity-100"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </Alert>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}