import { useEffect } from "react"
import { MessageSquareIcon } from "lucide-react"
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/modules/settings/hooks/use-settings-draft"
import type {TabDef} from "@/modules/settings/model/settings.types.ts";
import {DynamicSettingsCard, SettingsLoadingShell, TabShell} from "@/modules/settings/ui/settings.renderers.tsx";


export function ChatsTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)

    useEffect(() => { if (data) seed(data) }, [data, seed])

    if (isLoading) return <SettingsLoadingShell />
    if (!data) return null

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            <DynamicSettingsCard
                title="Чати"
                description="Параметри відображення та поведінки чатів"
                icon={MessageSquareIcon}
                settings={data}
                draft={draft}
                onChange={set}
            />
        </TabShell>
    )
}
