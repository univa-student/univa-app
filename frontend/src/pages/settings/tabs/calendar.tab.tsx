import { useState } from "react"
import { TabShell, ToggleSection, MultiSelectorSection, useToggleState } from "../settings.renderers"
import {
    formatSection, deadlinesSection,
    firstDayOptions, viewOptions, reminderOptions,
    deadlineToggles,
} from "../config/calendar.config"

export function CalendarTab() {
    const [selectors, setSelectors] = useState<Record<string, string>>({
        firstDay: "mon",
        view: "week",
        reminder: "30",
    })
    const deadlines = useToggleState(deadlineToggles)
    const updateSelector = (id: string, v: string) => setSelectors(p => ({ ...p, [id]: v }))

    return (
        <TabShell>
            <MultiSelectorSection
                section={formatSection}
                groups={[
                    { id: "firstDay", label: "Перший день тижня", options: firstDayOptions, columns: 2 },
                    { id: "view", label: "Вигляд за замовчуванням", options: viewOptions, columns: 2 },
                    { id: "reminder", label: "Нагадування до події (хвилин)", options: reminderOptions, columns: 3 },
                ]}
                values={selectors}
                onChange={updateSelector}
            />
            <ToggleSection section={deadlinesSection} settings={deadlineToggles} values={deadlines.values} onChange={deadlines.update} />
        </TabShell>
    )
}
