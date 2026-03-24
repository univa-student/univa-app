import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "./router/router";
import { queryClient } from "@/shared/api/query-client";
import { BaseProviders, AppProviders } from "./providers/providers";
import { AlertContainer } from "@/shared/providers/toast-provider";

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BaseProviders>
                <AppProviders>
                    <RouterProvider router={router} />
                    <AlertContainer />
                </AppProviders>
            </BaseProviders>
        </QueryClientProvider>
    );
}