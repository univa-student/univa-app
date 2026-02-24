import { authStore } from "../../../entities/user/model/auth-store";

export function useSignOut() {
    return () => authStore.getState().signOut();
}