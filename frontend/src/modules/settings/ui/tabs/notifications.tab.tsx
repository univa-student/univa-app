import { useEffect } from "react"
import { MailIcon, BellIcon } from "lucide-react"
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/modules/settings/hooks/use-settings-draft"
import type {TabDef} from "@/modules/settings/model/settings.types.ts";
import {DynamicSettingsCard, SettingsLoadingShell, TabShell} from "@/modules/settings/ui/settings.renderers.tsx";

export function NotificationsTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    useEffect(() => { if (data) seed(data) }, [data, seed])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    const emailSettings = data.filter(s => s.key.includes("email") || s.key.includes("digest"))
    const pushSettings = data.filter(s => !emailSettings.includes(s))

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            {emailSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Email-сповіщення"
                    icon={MailIcon}
                    settings={emailSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
            {pushSettings.length > 0 && (
                <DynamicSettingsCard
                    title="Push та звуки"
                    icon={BellIcon}
                    settings={pushSettings}
                    draft={draft}
                    onChange={set}
                />
            )}
        </TabShell>
    )
}
