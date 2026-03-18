/**
 * app/providers/theme-provider.tsx
 *
 * Applies the user's theme as a `.dark` class on <html> so all CSS
 * dark-mode selectors work correctly. Supports light / dark / system.
 */
import { useEffect } from "react";
import { useUserSettings } from "@/entities/user/hooks/use-user-settings";

function applyDark(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useUserSettings();

    useEffect(() => {
        if (theme === "dark") {
            applyDark(true);
            return;
        }
        if (theme === "light") {
            applyDark(false);
            return;
        }

        // "system" — follow OS preference and react to changes
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        applyDark(mq.matches);

        const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    return <>{children}</>;
}
