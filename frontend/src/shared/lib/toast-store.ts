export type ToastVariant = "default" | "info" | "success" | "warning" | "destructive";

export type ToastInput = {
    variant: ToastVariant;
    title?: string;
    message: string;
    autoCloseMs?: number;
};

export type Toast = ToastInput & {
    id: string;
};

type Listener = (toasts: Toast[]) => void;

class ToastStore {
    private toasts: Toast[] = [];
    private listeners: Set<Listener> = new Set();
    private timers: Map<string, number> = new Map();
    private readonly MAX_TOASTS = 6;
    private readonly DEFAULT_AUTOCLOSE = 3500;

    subscribe = (listener: Listener) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => {
        return this.toasts;
    };

    private notify() {
        this.listeners.forEach((listener) => listener(this.toasts));
    }

    toast = (data: ToastInput) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const newToast: Toast = { id, ...data };

        this.toasts = [...this.toasts, newToast].slice(-this.MAX_TOASTS);
        this.notify();

        const ms = data.autoCloseMs ?? this.DEFAULT_AUTOCLOSE;
        if (ms > 0) {
            const timer = window.setTimeout(() => this.dismiss(id), ms);
            this.timers.set(id, timer);
        }

        return id;
    };

    dismiss = (id: string) => {
        const t = this.timers.get(id);
        if (t) window.clearTimeout(t);
        this.timers.delete(id);

        this.toasts = this.toasts.filter((x) => x.id !== id);
        this.notify();
    };

    clear = () => {
        this.timers.forEach((t) => window.clearTimeout(t));
        this.timers.clear();
        this.toasts = [];
        this.notify();
    };
}

export const toastStore = new ToastStore();
export const toast = toastStore.toast;
export const dismissToast = toastStore.dismiss;
export const clearToasts = toastStore.clear;
