import { useSyncExternalStore } from "react";
import { authStore } from "./auth-store";

/**
 * Returns the currently authenticated user from the reactive authStore.
 * Returns null if not authenticated yet.
 */
export function useAuthUser() {
    return useSyncExternalStore(
        authStore.subscribe.bind(authStore),
        () => authStore.getState().user,
        () => authStore.getState().user,
    );
}
