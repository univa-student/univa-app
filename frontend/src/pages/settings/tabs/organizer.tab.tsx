import { useState } from "react"
import { TabShell, ToggleSection, MultiSelectorSection, useToggleState } from "../settings.renderers"
import {
    plannerSection, tasksSection,
    plannerViewOptions, plannerToggles, tasksToggles,
} from "../config/organizer.config"

export function OrganizerTab() {
    const [selectors, setSelectors] = useState<Record<string, string>>({ view: "day" })
    const planner = useToggleState(plannerToggles)
    const tasks = useToggleState(tasksToggles)
    const updateSelector = (id: string, v: string) => setSelectors(p => ({ ...p, [id]: v }))

    return (
        <TabShell>
            <MultiSelectorSection
                section={plannerSection}
                groups={[
                    { id: "view", label: "Вигляд планера за замовчуванням", options: plannerViewOptions, columns: 2 },
                ]}
                values={selectors}
                onChange={updateSelector}
            />
            <ToggleSection section={{ title: "Планер" }} settings={plannerToggles} values={planner.values} onChange={planner.update} />
            <ToggleSection section={tasksSection} settings={tasksToggles} values={tasks.values} onChange={tasks.update} />
        </TabShell>
    )
}
