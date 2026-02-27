import { useState, useEffect } from "react"
import { LayoutListIcon } from "lucide-react"
import { TabShell, ToggleSection, SelectorSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 10 // ORGANIZER_SETTINGS_GROUP_ID

const VIEW_OPTIONS = [
    { id: "kanban", label: "Kanban", description: "Стовпці задач" },
    { id: "list", label: "Список", description: "Лінійний список" },
    { id: "table", label: "Таблиця", description: "Рядки та стовпці" },
]

const VIEW_SEC = { title: "Вигляд", icon: LayoutListIcon, description: "Початковий вигляд органайзера" }
const GENERAL_SEC = { title: "Параметри" }

const TOGGLE_DEFS = [
    { id: "organizer.auto_archive", label: "Автоархівація", description: "Автоматично архівувати завершені завдання", defaultValue: false },
    { id: "organizer.show_completed", label: "Показувати виконані", description: "Відображати завершені завдання у списку", defaultValue: true },
]

export function OrganizerTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)

    const [view, setView] = useState("kanban")
    const [toggles, setToggles] = useState<Record<string, boolean>>(
        Object.fromEntries(TOGGLE_DEFS.map(s => [s.id, s.defaultValue]))
    )
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (!data) return
        const get = (key: string, fb: unknown) => data.find(s => s.key === key)?.value ?? fb
        setView(get("organizer.default_view", "kanban") as string)
        setToggles(prev => {
            const next = { ...prev }
            data.forEach(s => { if (s.key in next) next[s.key] = Boolean(s.value) })
            return next
        })
        setIsDirty(false)
    }, [data])

    const onSave = () => {
        mutate({ key: "organizer.default_view", value: view })
        Object.entries(toggles).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <SelectorSection
                section={VIEW_SEC}
                options={VIEW_OPTIONS}
                value={view as "kanban" | "list" | "table"}
                onChange={v => { setView(v); setIsDirty(true) }}
                variant="compact"
            />
            <ToggleSection
                section={GENERAL_SEC}
                settings={TOGGLE_DEFS}
                values={toggles}
                onChange={(id, v) => { setToggles(p => ({ ...p, [id]: v })); setIsDirty(true) }}
            />
        </TabShell>
    )
}
