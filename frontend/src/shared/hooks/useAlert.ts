import React, { useCallback, useState } from "react";

export type AlertVariant = "default" | "info" | "success" | "warning" | "destructive";

export type AppAlert = {
    id: number;
    variant: AlertVariant;
    title?: string;
    message: string;
    icon?: React.ReactNode;
    autoCloseMs?: number; // наприклад 4000
};

export function useAlert() {
    const [alert, setAlert] = useState<AppAlert | null>(null);

    const show = useCallback((next: Omit<AppAlert, "id">) => {
        const id = Date.now();
        setAlert({ id, ...next });

        if (next.autoCloseMs && next.autoCloseMs > 0) {
            window.setTimeout(() => {
                setAlert((current) => (current?.id === id ? null : current));
            }, next.autoCloseMs);
        }
    }, []);

    const hide = useCallback(() => setAlert(null), []);

    return { alert, show, hide };
}