import React, { useCallback, useRef, useState } from "react";

export type AlertVariant = "default" | "info" | "success" | "warning" | "destructive";

export type AppAlert = {
    id: number;
    variant: AlertVariant;
    title?: string;
    message: string;
    icon?: React.ReactNode;
    autoCloseMs?: number;
};

export function useAlert() {
    const [alerts, setAlerts] = useState<AppAlert[]>([]);
    const idRef = useRef(0);

    const show = useCallback((next: Omit<AppAlert, "id">) => {
        const id = ++idRef.current;

        const alert: AppAlert = { id, ...next };

        setAlerts((prev) => [...prev, alert]);

        if (next.autoCloseMs && next.autoCloseMs > 0) {
            const timer = window.setTimeout(() => {
                setAlerts((prev) => prev.filter((a) => a.id !== id));
            }, next.autoCloseMs);

            return () => clearTimeout(timer);
        }
    }, []);

    const hide = useCallback((id?: number) => {
        if (id === undefined) {
            setAlerts([]);
        } else {
            setAlerts((prev) => prev.filter((a) => a.id !== id));
        }
    }, []);

    return { alerts, show, hide };
}