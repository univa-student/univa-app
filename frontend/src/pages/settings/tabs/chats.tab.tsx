import { useState, useEffect } from "react"
import { MessageSquareIcon } from "lucide-react"
import { TabShell, ToggleSection, SettingsLoadingShell } from "../settings.renderers"
import { useSettingsGroup } from "@/entities/settings/hooks/use-settings-group"
import { useUpdateSetting } from "@/entities/settings/hooks/use-update-setting"
import type { TabDef } from "../settings.types"

const GROUP_ID = 8 // CHAT_SETTINGS_GROUP_ID

const CHAT_SEC = { title: "Чати", icon: MessageSquareIcon, description: "Параметри відображення та поведінки чатів" }

const TOGGLE_DEFS = [
    { id: "chat.enter_to_send", label: "Enter для надсилання", description: "Натискання Enter надсилає повідомлення", defaultValue: true },
    { id: "chat.read_receipts", label: "Підтвердження прочитання", description: "Показувати позначку прочитання", defaultValue: true },
    { id: "chat.media_autoplay", label: "Автовідтворення медіа", description: "Автоматично відтворювати відео та gif", defaultValue: true },
    { id: "chat.link_previews", label: "Попередній перегляд посилань", description: "Показувати превью для URL у чаті", defaultValue: true },
]

export function ChatsTab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId ?? GROUP_ID)
    const { mutate, isPending } = useUpdateSetting(tab.groupId ?? GROUP_ID)
    const [values, setValues] = useState<Record<string, boolean>>(
        Object.fromEntries(TOGGLE_DEFS.map(s => [s.id, s.defaultValue]))
    )
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

    const onSave = () => {
        Object.entries(values).forEach(([key, val]) => mutate({ key, value: val }))
        setIsDirty(false)
    }

    if (isLoading) return <SettingsLoadingShell />

    return (
        <TabShell showSave onSave={onSave} isSaving={isPending} isDirty={isDirty}>
            <ToggleSection
                section={CHAT_SEC}
                settings={TOGGLE_DEFS}
                values={values}
                onChange={(id, v) => { setValues(p => ({ ...p, [id]: v })); setIsDirty(true) }}
            />
        </TabShell>
    )
}
