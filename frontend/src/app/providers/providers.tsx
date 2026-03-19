import React from "react";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/shared/providers/toast-provider";
import { TooltipProvider } from "@/shared/shadcn/ui/tooltip";
import { AuthProvider } from "@/app/providers/auth-provider";
import { SettingsProvider } from "@/app/providers/settings-provider";
import { WsProvider } from "@/app/providers/ws-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { useUserSettings } from "@/modules/auth/hooks/use-user-settings";

// ─── Animation ───────────────────────────────────────────
function AnimationProvider({ children }: { children: React.ReactNode }) {
    const { animations } = useUserSettings();

    return (
        <MotionConfig reducedMotion={animations ? "never" : "always"}>
            {children}
        </MotionConfig>
    );
}

// ─── Base (завжди) ───────────────────────────────────────
export function BaseProviders({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
    );
}

// ─── App (глобальні) ─────────────────────────────────────
export function AppProviders({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}

// ─── Private (після auth) ────────────────────────────────
export function PrivateProviders({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <ThemeProvider>
                <AnimationProvider>
                    <WsProvider>{children}</WsProvider>
                </AnimationProvider>
            </ThemeProvider>
        </SettingsProvider>
    );
}