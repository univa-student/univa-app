import { useState, useEffect, useMemo } from "react";
import { themedLogoPair, type ThemedLogoKey } from "@/app/config/logo.config";

/**
 * React hook that returns the correct logo src for the current theme.
 * Reactively updates when the `dark` class toggles on <html>.
 *
 * @example
 * const logoSrc = useThemeLogo("full-no-bg")
 * <img src={logoSrc} alt="Univa" />
 */
export function useThemeLogo(key: ThemedLogoKey): string {
    const pair = useMemo(() => themedLogoPair(key), [key]);

    const [isDark, setIsDark] = useState(() =>
        typeof document !== "undefined"
            ? document.documentElement.classList.contains("dark")
            : false
    );

    useEffect(() => {
        const root = document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDark(root.classList.contains("dark"));
        });
        observer.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    return isDark ? pair.dark : pair.light;
}
