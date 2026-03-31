import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SettingsIcon } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { tabs } from "@/modules/settings/model/tabs.config"
import type { TabDef } from "@/modules/settings/model/settings.types"
import { AccountTab } from "@/modules/settings/ui/tabs/account.tab"
import { AITab } from "@/modules/settings/ui/tabs/ai.tab"
import { AppearanceTab } from "@/modules/settings/ui/tabs/appearance.tab"
import { ChatsTab } from "@/modules/settings/ui/tabs/chats.tab"
import { DangerTab } from "@/modules/settings/ui/tabs/danger.tab"
import { FilesTab } from "@/modules/settings/ui/tabs/files.tab"
import { IntegrationsTab } from "@/modules/settings/ui/tabs/integrations.tab"
import { NotificationsTab } from "@/modules/settings/ui/tabs/notifications.tab"
import { OrganizerTab } from "@/modules/settings/ui/tabs/organizer.tab"
import { ProfileTab } from "@/modules/settings/ui/tabs/profile.tab"
import { SchedulerTab } from "@/modules/settings/ui/tabs/scheduler.tab"
import { SecurityTab } from "@/modules/settings/ui/tabs/security.tab"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
import { Badge } from "@/shared/shadcn/ui/badge"
import { PageSidePanel } from "@/shared/ui/page-side-panel"

type TabFC = React.FC<{ tab: TabDef }>

const tabComponents: Record<string, TabFC> = {
    account: AccountTab,
    profile: ProfileTab,
    security: SecurityTab,
    notifications: NotificationsTab,
    appearance: AppearanceTab,
    ai: AITab,
    scheduler: SchedulerTab,
    chats: ChatsTab,
    files: FilesTab,
    organizer: OrganizerTab,
    integrations: IntegrationsTab,
    danger: DangerTab,
}

function normalizeTabId(tabId: string | null): string {
    if (tabId === "privacy") {
        return "security"
    }

    return tabId ?? "account"
}

export function SettingsPage() {
    usePageTitle("Налаштування", { suffix: true })

    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = normalizeTabId(searchParams.get("tab"))
    const [activeTab, setActiveTab] = useState(() =>
        tabs.some((tab) => tab.id === tabParam) ? tabParam : "account",
    )

    React.useEffect(() => {
        if (tabs.some((tab) => tab.id === tabParam) && tabParam !== activeTab) {
            setActiveTab(tabParam)
        }
    }, [activeTab, tabParam])

    const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]
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
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <SettingsIcon className="size-6 text-primary" />
                    Налаштування
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Керуй своїм акаунтом, безпекою, сповіщеннями та іншими параметрами
                </p>
            </div>

            <div className="flex gap-6">
                <PageSidePanel>
                    <nav className="flex h-full flex-col overflow-hidden p-3">
                        <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
                            {tabs.map((tab, idx) => {
                                const isActive = tab.id === activeTab
                                const isDanger = tab.id === "danger"
                                const showGroup = tab.group && (idx === 0 || tabs[idx - 1].group !== tab.group)

                                return (
                                    <div key={tab.id}>
                                        {showGroup && (
                                            <p className={["px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60", idx > 0 ? "mb-1.5 mt-4" : "mb-1.5"].join(" ")}>
                                                {tab.group}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => handleTabChange(tab.id)}
                                            className={[
                                                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all",
                                                isActive
                                                    ? isDanger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                                    : isDanger ? "text-destructive/60 hover:bg-destructive/5 hover:text-destructive" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                            ].join(" ")}
                                        >
                                            <tab.icon className="size-4" />
                                            {tab.label}
                                            {tab.badge && (
                                                <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[9px]">
                                                    {tab.badge}
                                                </Badge>
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </nav>
                </PageSidePanel>

                <div className="min-w-0 max-w-3xl flex-1 pt-2">
                    <div className="mb-5 border-b pb-4">
                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                            <currentTab.icon className="size-5 text-primary" />
                            {currentTab.label}
                        </h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">{currentTab.description}</p>
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
