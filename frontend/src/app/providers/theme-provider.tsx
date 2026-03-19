import { useEffect } from "react";
import { useUserSettings } from "@/modules/auth/hooks/use-user-settings";

function applyTheme(dark: boolean) {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.setAttribute("data-theme", dark ? "dark" : "light");
}

function getSystemTheme(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useUserSettings();

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (theme === "dark") {
            applyTheme(true);
            return;
        }

        if (theme === "light") {
            applyTheme(false);
            return;
        }

        // system
        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        applyTheme(mq.matches);

        const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
        mq.addEventListener("change", handler);

        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    return <>{children}</>;
}