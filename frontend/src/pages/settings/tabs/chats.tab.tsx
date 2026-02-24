import { TabShell, ToggleSection, useToggleState } from "../settings.renderers"
import { messagesSection, smartSection, messagesToggles, smartToggles } from "../config/chats.config"

export function ChatsTab() {
    const messages = useToggleState(messagesToggles)
    const smart = useToggleState(smartToggles)

    return (
        <TabShell>
            <ToggleSection section={messagesSection} settings={messagesToggles} values={messages.values} onChange={messages.update} />
            <ToggleSection section={smartSection} settings={smartToggles} values={smart.values} onChange={smart.update} />
        </TabShell>
    )
}
