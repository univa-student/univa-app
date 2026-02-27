import { useState, useEffect } from "react"
import { SunIcon, MoonIcon, MonitorIcon, GlobeIcon } from "lucide-react"
import { TabShell, ToggleSection, SelectorSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 4 // APPEARANCE_SETTINGS_GROUP_ID

const THEME_OPTIONS = [
    { id: "light", label: "Світла", description: "Легкий інтерфейс", icon: SunIcon },
    { id: "dark", label: "Темна", description: "Зберігає зір", icon: MoonIcon },
    { id: "system", label: "Системна", description: "Автоматично", icon: MonitorIcon },
]

const LANG_OPTIONS = [
    { id: "uk", label: "Українська", emoji: "🇺🇦" },
    { id: "en", label: "English", emoji: "🇬🇧" },
    { id: "pl", label: "Polski", emoji: "🇵🇱" },
]

const THEME_SEC = { title: "Тема", icon: SunIcon }
const LANG_SEC = { title: "Мова інтерфейсу", icon: GlobeIcon }
const IFACE_SEC = { title: "Інтерфейс" }
const IFACE_DEFS = [
    { id: "appearance.compact_mode", label: "Компактний режим", description: "Зменшити відступи та шрифти", defaultValue: false },
    { id: "appearance.animations", label: "Анімації", description: "Плавні переходи між сторінками", defaultValue: true },
]

export function AppearanceTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)

    // Local state seeded from API, then trackable as "dirty"
    const [theme, setTheme] = useState("system")
    const [lang, setLang] = useState("uk")
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        "appearance.compact_mode": false,
        "appearance.animations": true,
    })
    const [isDirty, setIsDirty] = useState(false)

    // Seed from API when data arrives
    useEffect(() => {
        if (!data) return
        const get = (key: string, fallback: unknown) =>
            data.find(s => s.key === key)?.value ?? fallback
        setTheme(get("appearance.theme", "system") as string)
        setLang(get("appearance.language", "uk") as string)
        setToggles({
            "appearance.compact_mode": Boolean(get("appearance.compact_mode", false)),
            "appearance.animations": Boolean(get("appearance.animations", true)),
        })
        setIsDirty(false)
    }, [data])

    const markDirty = () => setIsDirty(true)

    const onSave = () => {
        mutate({ key: "appearance.theme", value: theme })
        mutate({ key: "appearance.language", value: lang })
        Object.entries(toggles).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <SelectorSection
                section={THEME_SEC}
                options={THEME_OPTIONS}
                value={theme as "light" | "dark" | "system"}
                onChange={v => { setTheme(v); markDirty() }}
                variant="card"
            />
            <SelectorSection
                section={LANG_SEC}
                options={LANG_OPTIONS}
                value={lang as "uk" | "en" | "pl"}
                onChange={v => { setLang(v); markDirty() }}
                variant="emoji"
                columns={2}
            />
            <ToggleSection
                section={IFACE_SEC}
                settings={IFACE_DEFS}
                values={toggles}
                onChange={(id, v) => { setToggles(p => ({ ...p, [id]: v })); markDirty() }}
            />
        </TabShell>
    )
}
