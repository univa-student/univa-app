import { useEffect } from "react"
import { LayoutListIcon } from "lucide-react"
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/modules/settings/hooks/use-settings-draft"
import {DynamicSettingsCard, SettingsLoadingShell, TabShell} from "@/modules/settings/ui/settings.renderers.tsx";
import type {TabDef} from "@/modules/settings/model/settings.types.ts";

export function OrganizerTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (data) seed(data) }, [data])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    const enumSettings = data.filter(s => s.type === "enum")
    const boolSettings = data.filter(s => s.type === "bool")

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            {enumSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Вигляд"
                    description="Початковий вигляд органайзера"
                    icon={LayoutListIcon}
                    settings={enumSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
            {boolSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Параметри"
                    settings={boolSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
        </TabShell>
    )
}
