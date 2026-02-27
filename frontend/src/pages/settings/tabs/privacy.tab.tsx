import { useState, useEffect } from "react"
import { LockIcon, EyeIcon } from "lucide-react"
import { TabShell, ToggleSection, SelectorSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 5 // PRIVACY_SETTINGS_GROUP_ID

const VIS_OPTIONS = [
    { id: "everyone", label: "Усі" },
    { id: "friends", label: "Друзі" },
    { id: "nobody", label: "Ніхто" },
]

const VIS_SEC = { title: "Видимість профілю", icon: EyeIcon, description: "Хто може переглядати ваш профіль" }
const PRIVACY_SEC = { title: "Приватність", icon: LockIcon }

const TOGGLE_DEFS = [
    { id: "privacy.show_online_status", label: "Показувати статус онлайн", description: "Дозволити іншим бачити, коли ви онлайн", defaultValue: true },
    { id: "privacy.analytics_enabled", label: "Аналітика використання", description: "Допомогти покращити продукт анонімними даними", defaultValue: true },
]

export function PrivacyTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)
    const [visibility, setVisibility] = useState("friends")
    const [toggles, setToggles] = useState<Record<string, boolean>>(
        Object.fromEntries(TOGGLE_DEFS.map(s => [s.id, s.defaultValue]))
    )
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (!data) return
        const get = (key: string, fallback: unknown) => data.find(s => s.key === key)?.value ?? fallback
        setVisibility(get("privacy.profile_visibility", "friends") as string)
        setToggles(prev => {
            const next = { ...prev }
            data.forEach(s => { if (s.key in next) next[s.key] = Boolean(s.value) })
            return next
        })
        setIsDirty(false)
    }, [data])

    const onSave = () => {
        mutate({ key: "privacy.profile_visibility", value: visibility })
        Object.entries(toggles).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <SelectorSection
                section={VIS_SEC}
                options={VIS_OPTIONS}
                value={visibility as "everyone" | "friends" | "nobody"}
                onChange={v => { setVisibility(v); setIsDirty(true) }}
                columns={3}
            />
            <ToggleSection
                section={PRIVACY_SEC}
                settings={TOGGLE_DEFS}
                values={toggles}
                onChange={(id, v) => { setToggles(p => ({ ...p, [id]: v })); setIsDirty(true) }}
            />
        </TabShell>
    )
}
