import { useState } from "react"
import { TabShell, ToggleSection, SelectorSection, useToggleState } from "../settings.renderers"
import {
    storageSection, searchSection,
    storageToggles, previewQualityOptions, searchToggles,
} from "../config/files.config"

export function FilesTab() {
    const storage = useToggleState(storageToggles)
    const search = useToggleState(searchToggles)
    const [quality, setQuality] = useState("medium")

    return (
        <TabShell>
            <ToggleSection section={storageSection} settings={storageToggles} values={storage.values} onChange={storage.update} />
            <SelectorSection
                section={searchSection}
                label="Якість попереднього перегляду"
                options={previewQualityOptions}
                value={quality}
                onChange={setQuality}
                variant="compact"
            />
            <ToggleSection section={{ title: "Пошук та AI" }} settings={searchToggles} values={search.values} onChange={search.update} />
        </TabShell>
    )
}
