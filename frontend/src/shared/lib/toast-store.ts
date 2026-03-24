export type ToastVariant = "default" | "success" | "warning" | "destructive" | "info";

export type ToastInput = {
    title?: string;
    message: string;
    variant?: ToastVariant;
    autoCloseMs?: number;
};

export type Toast = ToastInput & {
    id: string;
    createdAt: number;
};

type ToastState = {
    toasts: Toast[];
};

let state: ToastState = {
    toasts: [],
};

const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((listener) => listener());
}

export const toastStore = {
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    getSnapshot() {
        return state.toasts;
    },
};

export function toast(input: ToastInput) {
    const nextToast: Toast = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        variant: input.variant ?? "default",
        title: input.title,
        message: input.message,
        autoCloseMs: input.autoCloseMs,
    };

    state = {
        ...state,
        toasts: [...state.toasts, nextToast],
    };

    emit();

    if (nextToast.autoCloseMs !== 0) {
        window.setTimeout(() => {
            dismissToast(nextToast.id);
        }, nextToast.autoCloseMs ?? 3500);
    }

    return nextToast.id;
}

export function dismissToast(id: string) {
    const nextToasts = state.toasts.filter((toast) => toast.id !== id);

    if (nextToasts === state.toasts) return;
    if (nextToasts.length === state.toasts.length) return;

    state = {
        ...state,
        toasts: nextToasts,
    };

    emit();
}

export function clearToasts() {
    if (state.toasts.length === 0) return;

    state = {
        ...state,
        toasts: [],
    };

    emit();
}