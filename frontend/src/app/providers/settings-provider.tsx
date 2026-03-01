import type { ReactNode } from "react";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

import { fetchUserSettings } from "@/entities/user/api/settings";
import { userSettingsStore } from "@/entities/user/model/settings-store";

type Props = {
    children: ReactNode;
};

export function SettingsProvider({ children }: Props) {
    const mutation = useMutation({
        mutationFn: fetchUserSettings,
        onSuccess: (settings) => {
            userSettingsStore.setSettings(settings);
            applyDomSettings(settings);
        },
        onError: () => {
            userSettingsStore.setReady(true);
        },
    });

    useEffect(() => {
        mutation.mutate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}

function applyDomSettings(settings: {
    theme: "light" | "dark" | "system";
    compact: boolean;
    animations: boolean;
    language: "uk" | "en" | "pl" | "auto";
}) {
    const root = document.documentElement;

    // theme: управляем классом .dark и color-scheme
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const effectiveTheme =
        settings.theme === "system" ? (prefersDark ? "dark" : "light") : settings.theme;

    if (effectiveTheme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }

    // compact / animations: через data-атрибуты
    root.dataset.compact = settings.compact ? "1" : "0";
    root.dataset.animations = settings.animations ? "1" : "0";

    // language: html[lang]
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    root.lang = settings.language === "auto" ? browserLang : settings.language;
}

