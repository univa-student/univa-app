import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "./router/router.tsx";
import { queryClient } from "@/shared/api/query-client";
import { BaseProviders, AppProviders } from "./providers/providers";
import { AlertContainer } from "@/shared/providers/toast-provider";

import "@/shared/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BaseProviders>
                <AppProviders>
                    <RouterProvider router={router} />
                </AppProviders>
                <AlertContainer />
            </BaseProviders>
        </QueryClientProvider>
    </React.StrictMode>
);