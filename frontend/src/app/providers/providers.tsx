import React from "react";
import { ToastProvider } from "@/shared/providers/toast-provider";
import { TooltipProvider } from "@/shared/shadcn/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
    );
}