import { useEffect } from "react"
import { EyeIcon, LockIcon } from "lucide-react"
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/modules/settings/hooks/use-settings-draft"
import type {TabDef} from "@/modules/settings/model/settings.types.ts";
import {DynamicSettingsCard, SettingsLoadingShell, TabShell} from "@/modules/settings/ui/settings.renderers.tsx";

export function PrivacyTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    useEffect(() => { if (data) seed(data) }, [data, seed])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    const visibilitySettings = data.filter(s => s.key === "privacy.profile_visibility")
    const privacySettings = data.filter(s => s.key !== "privacy.profile_visibility")

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            {visibilitySettings.length > 0 && (
                <DynamicSettingsCard
                    title="Видимість профілю"
                    description="Хто може переглядати ваш профіль"
                    icon={EyeIcon}
                    settings={visibilitySettings}
                    draft={draft}
                    onChange={set}
                />
            )}
            {privacySettings.length > 0 && (
                <DynamicSettingsCard
                    title="Приватність"
                    icon={LockIcon}
                    settings={privacySettings}
                    draft={draft}
                    onChange={set}
                />
            )}
        </TabShell>
    )
}
