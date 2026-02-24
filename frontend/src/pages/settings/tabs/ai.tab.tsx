import { useState } from "react"
import { TabShell, ToggleSection, MultiSelectorSection, useToggleState } from "../settings.renderers"
import {
    modelSection, behaviorSection,
    modelOptions, creativityOptions, languageOptions,
    behaviorToggles,
} from "../config/ai.config"

export function AITab() {
    const [selectors, setSelectors] = useState<Record<string, string>>({
        model: "balanced",
        creativity: "medium",
        language: "uk",
    })
    const behavior = useToggleState(behaviorToggles)

    const updateSelector = (id: string, v: string) => setSelectors(p => ({ ...p, [id]: v }))

    return (
        <TabShell>
            <MultiSelectorSection
                section={modelSection}
                groups={[
                    { id: "model", label: "Модель AI", options: modelOptions, variant: "card" },
                    { id: "creativity", label: "Рівень креативності", options: creativityOptions, variant: "compact" },
                    { id: "language", label: "Мова відповідей AI", options: languageOptions, variant: "emoji" },
                ]}
                values={selectors}
                onChange={updateSelector}
            />
            <ToggleSection section={behaviorSection} settings={behaviorToggles} values={behavior.values} onChange={behavior.update} />
        </TabShell>
    )
}
