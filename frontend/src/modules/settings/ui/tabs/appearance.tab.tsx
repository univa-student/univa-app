import { useEffect } from "react"
import { SunIcon, GlobeIcon, MonitorIcon } from "lucide-react"
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/modules/settings/hooks/use-settings-draft"
import {DynamicSettingsCard, SettingsLoadingShell, TabShell} from "@/modules/settings/ui/settings.renderers.tsx";
import type {TabDef} from "@/modules/settings/model/settings.types.ts";

export function AppearanceTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    useEffect(() => { if (data) seed(data) }, [data, seed])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    const themeSettings = data.filter(s => s.key === "theme")
    const langSettings = data.filter(s => s.key === "language")
    const ifaceSettings = data.filter(s => !["theme", "language"].includes(s.key))

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            {themeSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Тема"
                    icon={SunIcon}
                    settings={themeSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
            {langSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Мова інтерфейсу"
                    icon={GlobeIcon}
                    settings={langSettings}
                    draft={draft}
                    onChange={set}
                    enumColumns={3}
                />
            )}
            {ifaceSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Інтерфейс"
                    icon={MonitorIcon}
                    settings={ifaceSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
        </TabShell>
    )
}
