import { TabShell, ToggleSection, useToggleState } from "../settings.renderers"
import { emailSection, pushSection, soundSection, emailToggles, pushToggles, soundToggles } from "../config/notifications.config"

export function NotificationsTab() {
    const email = useToggleState(emailToggles)
    const push = useToggleState(pushToggles)
    const sound = useToggleState(soundToggles)

    return (
        <TabShell>
            <ToggleSection section={emailSection} settings={emailToggles} values={email.values} onChange={email.update} />
            <ToggleSection section={pushSection} settings={pushToggles} values={push.values} onChange={push.update} />
            <ToggleSection section={soundSection} settings={soundToggles} values={sound.values} onChange={sound.update} />
        </TabShell>
    )
}
