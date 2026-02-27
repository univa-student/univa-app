import { useState, useEffect } from "react"
import { CalendarIcon, BellIcon } from "lucide-react"
import { TabShell, ToggleSection, MultiSelectorSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 7 // SCHEDULER_SETTINGS_GROUP_ID

const CAL_SEC = { title: "Розклад", icon: CalendarIcon, description: "Параметри відображення розкладу" }
const ALERT_SEC = { title: "Нагадування", icon: BellIcon }

const SELECTOR_GROUPS = [
    {
        id: "scheduler.first_day_of_week", label: "Перший день тижня",
        options: [
            { id: "mon", label: "Понеділок" },
            { id: "sun", label: "Неділя" },
        ],
        columns: 2 as const, variant: "compact" as const,
    },
    {
        id: "scheduler.default_view", label: "Вигляд за замовчуванням",
        options: [
            { id: "day", label: "День" },
            { id: "week", label: "Тиждень" },
        ],
        columns: 2 as const, variant: "compact" as const,
    },
    {
        id: "scheduler.reminder_minutes", label: "Нагадування перед подією",
        options: [
            { id: "15", label: "15 хв" },
            { id: "30", label: "30 хв" },
            { id: "60", label: "1 год" },
        ],
        columns: 3 as const, variant: "compact" as const,
    },
]

const TOGGLE_DEFS = [
    { id: "scheduler.deadline_alerts", label: "Сповіщення про дедлайни", description: "Отримувати нагадування про наближення дедлайнів", defaultValue: true },
]

export function SchedulerTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)

    const [selectors, setSelectors] = useState<Record<string, string>>({
        "scheduler.first_day_of_week": "mon",
        "scheduler.default_view": "week",
        "scheduler.reminder_minutes": "15",
    })
    const [toggles, setToggles] = useState<Record<string, boolean>>({ "scheduler.deadline_alerts": true })
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (!data) return
        setSelectors(prev => {
            const next = { ...prev }
            data.forEach(s => { if (s.key in next) next[s.key] = String(s.value ?? next[s.key]) })
            return next
        })
        setToggles(prev => {
            const next = { ...prev }
            data.forEach(s => { if (s.key in next) next[s.key] = Boolean(s.value) })
            return next
        })
        setIsDirty(false)
    }, [data])

    const onSave = () => {
        Object.entries(selectors).forEach(([key, val]) => mutate({ key, value: val }))
        Object.entries(toggles).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <MultiSelectorSection
                section={CAL_SEC}
                groups={SELECTOR_GROUPS}
                values={selectors}
                onChange={(id, v) => { setSelectors(p => ({ ...p, [id]: v })); setIsDirty(true) }}
            />
            <ToggleSection
                section={ALERT_SEC}
                settings={TOGGLE_DEFS}
                values={toggles}
                onChange={(id, v) => { setToggles(p => ({ ...p, [id]: v })); setIsDirty(true) }}
            />
        </TabShell>
    )
}
