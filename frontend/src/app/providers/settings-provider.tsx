import type { ReactNode } from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchUserSettings } from "@/modules/auth/api/settings/fetch-user-settings";
import { mapUiSettings } from "@/modules/auth/lib/settings/map-ui-settings";
import { applyDomSettings } from "@/modules/auth/lib/settings/apply-dom-settings";
import { loadCachedUiSettings, saveCachedUiSettings } from "@/modules/auth/lib/settings/settings-cache";
import { userSettingsStore } from "@/modules/settings/model/settings-store";

type Props = {
    children: ReactNode;
};

export function SettingsProvider({ children }: Props) {
    useEffect(() => {
        const cached = loadCachedUiSettings();
        if (cached) {
            applyDomSettings(cached);
            userSettingsStore.setAll({ ui: cached, items: [] });
        }
    }, []);

    const { data, isError } = useQuery({
        queryKey: ["user-settings"],
        queryFn: fetchUserSettings,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (data) {
            const ui = mapUiSettings(data);

            userSettingsStore.setAll({ ui, items: data });
            saveCachedUiSettings(ui);
            applyDomSettings(ui);
            userSettingsStore.setReady(true);
        }

        if (isError) {
            userSettingsStore.setReady(true);
        }
    }, [data, isError]);

    return <>{children}</>;
}
