import { redirect } from "react-router-dom";

import { queryClient } from "@/shared/api/query-client";
import { authStore } from "@/modules/auth/model/auth-store";
import { userQueries } from "@/modules/auth/api/queries";

// ─── helpers ─────────────────────────────────────────────
function setAuth(user: Parameters<typeof authStore.setUser>[0]) {
    authStore.setUser(user);
    authStore.setReady(true);
}

// ─── loaders ─────────────────────────────────────────────
export const routesLoaders = {
    publicRoot: async () => {
        setAuth(null);
        return null;
    },

    guestOnly: async () => {
        setAuth(null);

        if (authStore.getState().user !== null) {
            return redirect("/dashboard");
        }

        return null;
    },

    privateRoot: async () => {
        try {
            const user = await queryClient.ensureQueryData(userQueries.me());
            setAuth(user);
            return null;
        } catch {
            setAuth(null);
            return redirect("/login");
        }
    },
};