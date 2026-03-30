import { redirect } from "react-router-dom";

import { queryClient } from "@/shared/api/query-client";
import { authStore } from "@/modules/auth/model/auth-store";
import { userQueries } from "@/modules/auth/api/queries";

function setAuth(user: Parameters<typeof authStore.setUser>[0]) {
    authStore.setUser(user);
    authStore.setReady(true);
}

export const routesLoaders = {
    publicRoot: async () => {
        // Optionally prefetch the user silently if they have a session, 
        // but DO NOT clear it here, as this loader re-runs on mutations.
        try {
            const user = await queryClient.fetchQuery({
                ...userQueries.me(),
                staleTime: 5000, 
            });
            setAuth(user);
        } catch {
            // just ignore, let them be unauthenticated if it fails
        }
        return null;
    },

    guestOnly: async () => {
        try {
            // Check if user is already logged in
            const user = await queryClient.fetchQuery({
                ...userQueries.me(),
                staleTime: 5000,
            });
            if (user) {
                setAuth(user);
                return redirect("/dashboard");
            }
        } catch {
            // Not logged in, can view guest pages
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