/**
 * PageSidePanel — renders children into the #app-side-panel portal slot.
 *
 * Usage in any page component:
 *   <PageSidePanel>
 *     <MyCustomSidebar />
 *   </PageSidePanel>
 *
 * The panel auto-shows when content is injected and hides when unmounted.
 */
import { createPortal } from "react-dom"
import { useEffect, useState, type ReactNode } from "react"

interface PageSidePanelProps {
    children: ReactNode
}

export function PageSidePanel({ children }: PageSidePanelProps) {
    const [target, setTarget] = useState<HTMLElement | null>(null)

    useEffect(() => {
        // Find the portal slot after DOM commit
        const el = document.getElementById("app-side-panel")
        setTarget(el)

        // Cleanup: when unmounted, nothing else is needed — React portal
        // removal handles it automatically
    }, [])

    if (!target) return null

    return createPortal(children, target)
}
