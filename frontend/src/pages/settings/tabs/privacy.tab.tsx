import { motion } from "framer-motion"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { itemAnim } from "../settings.animations"
import { TabShell, ToggleSection, useToggleState } from "../settings.renderers"
import { visibilitySection, dataSection, visibilityToggles, dataToggles } from "../config/privacy.config"
import { DownloadIcon } from "lucide-react"

export function PrivacyTab() {
    const visibility = useToggleState(visibilityToggles)
    const data = useToggleState(dataToggles)

    return (
        <TabShell>
            <ToggleSection section={visibilitySection} settings={visibilityToggles} values={visibility.values} onChange={visibility.update} />
            <ToggleSection section={dataSection} settings={dataToggles} values={data.values} onChange={data.update} />
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DownloadIcon className="size-5 text-primary" />
                            Ваші дані
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div>
                                <p className="text-sm font-medium">Завантажити копію даних</p>
                                <p className="text-xs text-muted-foreground">Усі ваші дані у форматі JSON</p>
                            </div>
                            <Button variant="outline" size="sm">Завантажити</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </TabShell>
    )
}
