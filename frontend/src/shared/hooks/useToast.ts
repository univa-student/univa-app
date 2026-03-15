import { toast as globalToast, dismissToast, clearToasts } from "@/shared/lib/toast-store";

export function useToast() {
    return {
        toast: globalToast,
        dismiss: dismissToast,
        clear: clearToasts,
    };
}
