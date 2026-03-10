/**
 * app/providers/theme-provider.tsx
 *
 * Applies the user's theme preference as a `data-theme` attribute on <html>.
 * Reads from the settings store so it reacts to settings changes in real time.
 */
import { useEffect } from "react";
import { useUserSettings } from "@/entities/user/hooks/use-user-settings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useUserSettings();

    useEffect(() => {
        const root = document.documentElement;
        if (theme) {
            root.setAttribute("data-theme", theme);
        }
    }, [theme]);

    return <>{children}</>;
}
