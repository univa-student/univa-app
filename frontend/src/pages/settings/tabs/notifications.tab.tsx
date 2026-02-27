import { useState, useEffect } from "react"
import { BellIcon, MailIcon } from "lucide-react"
import { TabShell, ToggleSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 3 // NOTIFICATION_SETTINGS_GROUP_ID

const EMAIL_SEC = { title: "Email-сповіщення", icon: MailIcon }
const PUSH_SEC = { title: "Push та звуки", icon: BellIcon }

const EMAIL_DEFS = [
    { id: "notification.email_enabled", label: "Email-сповіщення", description: "Отримувати сповіщення на пошту", defaultValue: true },
    { id: "notification.weekly_digest", label: "Щотижневий дайджест", description: "Отримувати зведення активності за тиждень", defaultValue: false },
]

const PUSH_DEFS = [
    { id: "notification.push_enabled", label: "Push-сповіщення", description: "Отримувати push-повідомлення в браузері", defaultValue: true },
    { id: "notification.sound_enabled", label: "Звук сповіщень", description: "Програвати звук при отриманні сповіщень", defaultValue: true },
]

const ALL_DEFS = [...EMAIL_DEFS, ...PUSH_DEFS]

function initToggles() {
    return Object.fromEntries(ALL_DEFS.map(s => [s.id, s.defaultValue]))
}

export function NotificationsTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)
    const [values, setValues] = useState<Record<string, boolean>>(initToggles)
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        if (!data) return
        setValues(prev => {
            const next = { ...prev }
            data.forEach(s => { if (s.key in next) next[s.key] = Boolean(s.value) })
            return next
        })
        setIsDirty(false)
    }, [data])

    const onChange = (id: string, v: boolean) => { setValues(p => ({ ...p, [id]: v })); setIsDirty(true) }
    const onSave = () => {
        Object.entries(values).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <ToggleSection section={EMAIL_SEC} settings={EMAIL_DEFS} values={values} onChange={onChange} />
            <ToggleSection section={PUSH_SEC} settings={PUSH_DEFS} values={values} onChange={onChange} />
        </TabShell>
    )
}
