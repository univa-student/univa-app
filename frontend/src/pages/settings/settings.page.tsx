import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "react-router-dom"
import { SettingsIcon } from "lucide-react"
import { Badge } from "@/shared/shadcn/ui/badge"
import { PageSidePanel } from "@/shared/ui/page-side-panel"
import { tabs } from "@/modules/settings/model/tabs.config"
import { AccountTab } from "@/modules/settings/ui/tabs/account.tab"
import { SecurityTab } from "@/modules/settings/ui/tabs/security.tab"
import { NotificationsTab } from "@/modules/settings/ui/tabs/notifications.tab"
import { AppearanceTab } from "@/modules/settings/ui/tabs/appearance.tab"
import { PrivacyTab } from "@/modules/settings/ui/tabs/privacy.tab"
import { AITab } from "@/modules/settings/ui/tabs/ai.tab"
import { SchedulerTab } from "@/modules/settings/ui/tabs/scheduler.tab"
import { ChatsTab } from "@/modules/settings/ui/tabs/chats.tab"
import { FilesTab } from "@/modules/settings/ui/tabs/files.tab"
import { OrganizerTab } from "@/modules/settings/ui/tabs/organizer.tab"
import { IntegrationsTab } from "@/modules/settings/ui/tabs/integrations.tab"
import { DangerTab } from "@/modules/settings/ui/tabs/danger.tab"
import { ProfileTab } from "@/modules/settings/ui/tabs/profile.tab"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
import type { TabDef } from "@/modules/settings/model/settings.types"

type TabFC = React.FC<{ tab: TabDef }>

const tabComponents: Record<string, TabFC> = {
    account: AccountTab,
    profile: ProfileTab,
    security: SecurityTab,
    notifications: NotificationsTab,
    appearance: AppearanceTab,
    privacy: PrivacyTab,
    ai: AITab,
    scheduler: SchedulerTab,
    chats: ChatsTab,
    files: FilesTab,
    organizer: OrganizerTab,
    integrations: IntegrationsTab,
    danger: DangerTab,
}

export function SettingsPage() {
    usePageTitle("Налаштування", { suffix: true })
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get("tab")
    const [activeTab, setActiveTab] = useState(() =>
        tabs.some((tab) => tab.id === tabParam) ? tabParam! : "account",
    )
    React.useEffect(() => {
        if (tabParam && tabs.some((tab) => tab.id === tabParam) && tabParam !== activeTab) {
            setActiveTab(tabParam)
        }
    }, [activeTab, tabParam])
    const currentTab = tabs.find(t => t.id === activeTab)!
    const Content = tabComponents[activeTab]

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        const next = new URLSearchParams(searchParams)
        next.set("tab", tabId)
        setSearchParams(next, { replace: true })
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <SettingsIcon className="size-6 text-primary" />
                    Налаштування
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Керуй своїм аккаунтом, безпекою, сповіщеннями та іншими параметрами
                </p>
            </div>

            {/* Layout: sidebar + content */}
            <div className="flex gap-6">
                <PageSidePanel>
                    {/* Sidebar nav */}
                    <nav className="flex flex-col h-full overflow-hidden p-3">
                        <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
                            {tabs.map((tab, idx) => {
                                const isActive = tab.id === activeTab
                                const isDanger = tab.id === "danger"
                                const showGroup = tab.group && (idx === 0 || tabs[idx - 1].group !== tab.group)
                                return (
                                    <div key={tab.id}>
                                        {showGroup && (
                                            <p className={["text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3", idx > 0 ? "mt-4 mb-1.5" : "mb-1.5"].join(" ")}>
                                                {tab.group}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => handleTabChange(tab.id)}
                                            className={[
                                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left w-full",
                                                isActive
                                                    ? isDanger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                                    : isDanger ? "text-destructive/60 hover:text-destructive hover:bg-destructive/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                                            ].join(" ")}
                                        >
                                            <tab.icon className="size-4" />
                                            {tab.label}
                                            {tab.badge && (
                                                <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0">{tab.badge}</Badge>
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </nav>
                </PageSidePanel>

                <div className="flex-1 min-w-0 max-w-3xl pt-2">
                    <div className="mb-5 pb-4 border-b">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <currentTab.icon className="size-5 text-primary" />
                            {currentTab.label}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{currentTab.description}</p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {Content ? <Content tab={currentTab} /> : null}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
