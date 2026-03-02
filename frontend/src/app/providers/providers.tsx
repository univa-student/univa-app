import React from "react";
import { ToastProvider } from "@/shared/providers/toast-provider";
import { TooltipProvider } from "@/shared/shadcn/ui/tooltip.tsx";
import {AuthProvider} from "@/app/providers/auth-provider.tsx";
import {SettingsProvider} from "@/app/providers/settings-provider.tsx";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <AuthProvider>
                <TooltipProvider delayDuration={0}>
                    <ToastProvider>{children}</ToastProvider>
                </TooltipProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}