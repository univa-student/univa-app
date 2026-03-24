import { useState, useEffect, useMemo } from "react";
import { themedLogoPair, type ThemedLogoKey } from "@/app/config/logo.config";

export function useThemeLogo(key: ThemedLogoKey): string {
    const pair = useMemo(() => themedLogoPair(key), [key]);

    const getIsDark = () =>
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

    const [isDark, setIsDark] = useState(getIsDark);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        const update = () => setIsDark(getIsDark());

        mq.addEventListener("change", update);

        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            mq.removeEventListener("change", update);
            observer.disconnect();
        };
    }, []);

    return isDark ? pair.dark : pair.light;
}