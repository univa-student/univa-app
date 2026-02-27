import { useState, useEffect } from "react"
import { HardDriveIcon } from "lucide-react"
import { TabShell, ToggleSection, SelectorSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 9 // FILE_SETTINGS_GROUP_ID

const QUALITY_OPTIONS = [
    { id: "low", label: "Низька", description: "Швидкий перегляд" },
    { id: "medium", label: "Середня", description: "Оптимально" },
    { id: "high", label: "Висока", description: "Максимальна деталь" },
]

const QUALITY_SEC = { title: "Якість перегляду", icon: HardDriveIcon }
const STORAGE_SEC = { title: "Сховище та синхронізація" }

const TOGGLE_DEFS = [
    { id: "file.auto_sync", label: "Автосинхронізація", description: "Автоматично синхронізувати файли", defaultValue: true },
    { id: "file.confirm_delete", label: "Підтвердження видалення", description: "Запитувати підтвердження перед видаленням", defaultValue: true },
]

export function FilesTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)

    const [quality, setQuality] = useState("medium")
    const [toggles, setToggles] = useState<Record<string, boolean>>(
        Object.fromEntries(TOGGLE_DEFS.map(s => [s.id, s.defaultValue]))
    )
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (!data) return
        const get = (key: string, fb: unknown) => data.find(s => s.key === key)?.value ?? fb
        setQuality(get("file.preview_quality", "medium") as string)
        setToggles(prev => {
            const next = { ...prev }
            data.forEach(s => { if (s.key in next) next[s.key] = Boolean(s.value) })
            return next
        })
        setIsDirty(false)
    }, [data])

    const onSave = () => {
        mutate({ key: "file.preview_quality", value: quality })
        Object.entries(toggles).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <SelectorSection
                section={QUALITY_SEC}
                options={QUALITY_OPTIONS}
                value={quality as "low" | "medium" | "high"}
                onChange={v => { setQuality(v); setIsDirty(true) }}
                variant="compact"
            />
            <ToggleSection
                section={STORAGE_SEC}
                settings={TOGGLE_DEFS}
                values={toggles}
                onChange={(id, v) => { setToggles(p => ({ ...p, [id]: v })); setIsDirty(true) }}
            />
        </TabShell>
    )
}
