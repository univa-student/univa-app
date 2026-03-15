import { redirect } from "react-router-dom";

import { queryClient } from "@/shared/api/query-client.ts";
import { authStore } from "@/entities/user/model/auth-store.ts";
import { userQueries } from "@/entities/user/api/queries.ts";

export const routesLoaders = {
    publicRoot: async () => {
        authStore.setReady(true);
        return null;
    },

    guestOnly: async () => {
        authStore.setReady(true);

        if (authStore.getState().user !== null) {
            return redirect("/dashboard");
        }

        return null;
    },

    privateRoot: async () => {
        try {
            const user = await queryClient.ensureQueryData(userQueries.me());

            authStore.setUser(user);
            authStore.setReady(true);

            return null;
        } catch {
            authStore.setUser(null);
            authStore.setReady(true);

            return redirect("/login");
        }
    },
};
