import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

/* ─── Context ────────────────────────────────────────────────────── */

interface AppFrameContextValue {
    /** Current page title displayed in the top bar */
    pageTitle: string
    setPageTitle: (title: string) => void

    /** Side panel (left dynamic panel) open state */
    sidePanelOpen: boolean
    toggleSidePanel: () => void
    setSidePanelOpen: (open: boolean) => void

    /** Current pathname for active-icon highlighting */
    pathname: string
}

const AppFrameContext = createContext<AppFrameContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAppFrame() {
    const ctx = useContext(AppFrameContext)
    if (!ctx) throw new Error("useAppFrame must be used within <AppFrame />")
    return ctx
}

/* ─── Provider ───────────────────────────────────────────────────── */

interface AppFrameProps {
    children: React.ReactNode
}

export function AppFrame({ children }: AppFrameProps) {
    const { pathname } = useLocation()
    const [pageTitle, setPageTitle] = useState("")
    const [sidePanelOpen, setSidePanelOpen] = useState(true)

    const toggleSidePanel = useCallback(() => {
        setSidePanelOpen(prev => !prev)
    }, [])

    /* Ctrl+B toggle */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggleSidePanel()
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [toggleSidePanel])

    const value = useMemo<AppFrameContextValue>(() => ({
        pageTitle,
        setPageTitle,
        sidePanelOpen,
        toggleSidePanel,
        setSidePanelOpen,
        pathname,
    }), [pageTitle, sidePanelOpen, toggleSidePanel, pathname])

    return (
        <AppFrameContext.Provider value={value}>
            <div className="app-frame island-canvas" data-island-layout>
                {children}
            </div>
        </AppFrameContext.Provider>
    )
}
