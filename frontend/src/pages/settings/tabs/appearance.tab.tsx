import { useState } from "react"
import { TabShell, ToggleSection, SelectorSection, useToggleState } from "../settings.renderers"
import {
    themeSection, languageSection, interfaceSection,
    themeOptions, languageOptions, interfaceToggles,
} from "../config/appearance.config"

export function AppearanceTab() {
    const [theme, setTheme] = useState("system")
    const [language, setLanguage] = useState("uk")
    const ui = useToggleState(interfaceToggles)

    return (
        <TabShell>
            <SelectorSection section={themeSection} options={themeOptions} value={theme} onChange={setTheme} variant="card" />
            <SelectorSection section={languageSection} options={languageOptions} value={language} onChange={setLanguage} variant="emoji" />
            <ToggleSection section={interfaceSection} settings={interfaceToggles} values={ui.values} onChange={ui.update} />
        </TabShell>
    )
}
