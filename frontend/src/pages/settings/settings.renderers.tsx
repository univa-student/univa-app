import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Button } from "@/shared/shadcn/ui/button"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"
import { Toggle } from "./settings.toggle"
import { containerAnim, itemAnim } from "./settings.animations"
import type { ToggleSetting, SelectorOption, SectionConfig } from "./settings.types"


/* ════════════════════════════════════════════════════════════
   ToggleSection — renders a Card with a list of toggle rows
   driven entirely by a config array
   ════════════════════════════════════════════════════════════ */

interface ToggleSectionProps {
    section: SectionConfig
    settings: ToggleSetting[]
    values: Record<string, boolean>
    onChange: (id: string, value: boolean) => void
}

export function ToggleSection({ section, settings, values, onChange }: ToggleSectionProps) {
    return (
        <motion.div variants={itemAnim}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {section.icon && <section.icon className="size-5 text-primary" />}
                        {section.title}
                    </CardTitle>
                    {section.description && <CardDescription>{section.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {settings.map((s, idx) => (
                        <div key={s.id}>
                            {idx > 0 && <Separator className="mb-4" />}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{s.label}</p>
                                    <p className="text-xs text-muted-foreground">{s.description}</p>
                                </div>
                                <Toggle
                                    checked={values[s.id] ?? s.defaultValue}
                                    onChange={v => onChange(s.id, v)}
                                    label={s.label}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    )
}

/* ════════════════════════════════════════════════════════════
   SelectorSection — renders a Card with a grid of selectable
   options (theme picker, language, AI model, etc.)
   ════════════════════════════════════════════════════════════ */

interface SelectorSectionProps<T extends string> {
    section: SectionConfig
    label?: string
    options: SelectorOption<T>[]
    value: T
    onChange: (value: T) => void
    columns?: 2 | 3
    variant?: "card" | "compact" | "emoji"
}

export function SelectorSection<T extends string>({
    section, label, options, value, onChange, columns = 3, variant = "card",
}: SelectorSectionProps<T>) {
    const gridCls = columns === 2 ? "grid-cols-2" : "grid-cols-3"

    return (
        <motion.div variants={itemAnim}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {section.icon && <section.icon className="size-5 text-primary" />}
                        {section.title}
                    </CardTitle>
                    {section.description && <CardDescription>{section.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {label && <p className="text-sm font-medium mb-2">{label}</p>}
                    <div className={`grid ${gridCls} gap-3`}>
                        {options.map(opt => {
                            const isActive = value === opt.id
                            const base = "rounded-lg border transition-all cursor-pointer"
                            const activeStyle = isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"

                            if (variant === "emoji") {
                                return (
                                    <button key={opt.id} onClick={() => onChange(opt.id)}
                                        className={`flex items-center gap-3 p-3 ${base} ${activeStyle}`}>
                                        {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </button>
                                )
                            }
                            if (variant === "compact") {
                                return (
                                    <button key={opt.id} onClick={() => onChange(opt.id)}
                                        className={`flex flex-col items-center gap-2 p-4 ${base} ${activeStyle}`}>
                                        {opt.icon && (
                                            <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
                                                <opt.icon className="size-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <p className="text-sm font-medium">{opt.label}</p>
                                        {opt.description && <p className="text-[10px] text-muted-foreground text-center">{opt.description}</p>}
                                    </button>
                                )
                            }
                            // "card" variant
                            return (
                                <button key={opt.id} onClick={() => onChange(opt.id)}
                                    className={`flex flex-col items-center gap-2 p-4 ${base} ${activeStyle}`}>
                                    {opt.icon && (
                                        <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
                                            <opt.icon className="size-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <p className="text-sm font-medium">{opt.label}</p>
                                    {opt.description && (
                                        <p className="text-[10px] text-muted-foreground text-center">{opt.description}</p>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

/* ════════════════════════════════════════════════════════════
   MultiSelectorSection — one Card with multiple selector groups
   ════════════════════════════════════════════════════════════ */

interface SelectorGroup<T extends string = string> {
    id: string
    label: string
    options: SelectorOption<T>[]
    columns?: 2 | 3
    variant?: "card" | "compact" | "emoji"
}

interface MultiSelectorSectionProps {
    section: SectionConfig
    groups: SelectorGroup[]
    values: Record<string, string>
    onChange: (groupId: string, value: string) => void
}

export function MultiSelectorSection({ section, groups, values, onChange }: MultiSelectorSectionProps) {
    return (
        <motion.div variants={itemAnim}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {section.icon && <section.icon className="size-5 text-primary" />}
                        {section.title}
                    </CardTitle>
                    {section.description && <CardDescription>{section.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    {groups.map((group, idx) => {
                        const gridCls = (group.columns ?? 3) === 2 ? "grid-cols-2" : "grid-cols-3"
                        return (
                            <div key={group.id}>
                                {idx > 0 && <Separator className="mb-5" />}
                                <p className="text-sm font-medium mb-2">{group.label}</p>
                                <div className={`grid ${gridCls} gap-3`}>
                                    {group.options.map(opt => {
                                        const isActive = values[group.id] === opt.id
                                        const base = "rounded-lg border transition-all cursor-pointer"
                                        const activeStyle = isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                                        const variant = group.variant ?? "compact"

                                        if (variant === "emoji") {
                                            return (
                                                <button key={opt.id} onClick={() => onChange(group.id, opt.id)}
                                                    className={`flex items-center gap-2 p-3 ${base} ${activeStyle}`}>
                                                    {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
                                                    <span className="text-sm font-medium">{opt.label}</span>
                                                </button>
                                            )
                                        }
                                        if (variant === "card") {
                                            return (
                                                <button key={opt.id} onClick={() => onChange(group.id, opt.id)}
                                                    className={`flex flex-col items-center gap-2 p-4 ${base} ${activeStyle}`}>
                                                    {opt.icon && (
                                                        <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
                                                            <opt.icon className="size-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <p className="text-sm font-medium">{opt.label}</p>
                                                    {opt.description && <p className="text-[10px] text-muted-foreground text-center">{opt.description}</p>}
                                                </button>
                                            )
                                        }
                                        // compact
                                        return (
                                            <button key={opt.id} onClick={() => onChange(group.id, opt.id)}
                                                className={`flex flex-col items-center gap-1 p-3 ${base} ${activeStyle}`}>
                                                <span className="text-sm font-medium">{opt.label}</span>
                                                {opt.description && <span className="text-[10px] text-muted-foreground">{opt.description}</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </motion.div>
    )
}

/* ════════════════════════════════════════════════════════════
   TabShell — wraps tab content with animation + save button
   ════════════════════════════════════════════════════════════ */

interface TabShellProps {
    children: React.ReactNode
    showSave?: boolean
    onSave?: () => void
    isSaving?: boolean
    isDirty?: boolean
}

export function TabShell({ children, showSave = true, onSave, isSaving, isDirty }: TabShellProps) {
    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
            {children}
            {showSave && (
                <motion.div variants={itemAnim} className="flex justify-end">
                    <Button
                        onClick={onSave}
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving ? "Зберігається…" : "Зберегти зміни"}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}

/* ════════════════════════════════════════════════════════════
   SettingsLoadingShell — skeleton while API data loads
   ════════════════════════════════════════════════════════════ */

export function SettingsLoadingShell() {
    return (
        <div className="flex flex-col gap-6">
            {[1, 2].map(i => (
                <div key={i} className="rounded-xl border p-6 flex flex-col gap-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex flex-col gap-3 mt-2">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="flex items-center justify-between">
                                <div className="flex flex-col gap-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-6 w-12 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ════════════════════════════════════════════════════════════
   useToggleState — hook to manage a group of toggle values
   from a config array
   ════════════════════════════════════════════════════════════ */

import { useState } from "react"

// eslint-disable-next-line react-refresh/only-export-components
export function useToggleState(settings: ToggleSetting[]) {
    const initial = Object.fromEntries(settings.map(s => [s.id, s.defaultValue]))
    const [values, setValues] = useState<Record<string, boolean>>(initial)
    const update = (id: string, v: boolean) => setValues(prev => ({ ...prev, [id]: v }))
    return { values, update }
}

/* ════════════════════════════════════════════════════════════
   useSelectorState — hook to manage a group of selector values
   ════════════════════════════════════════════════════════════ */

export function useSelectorState(defaults: Record<string, string>) {
    const [values, setValues] = useState(defaults)
    const update = (id: string, v: string) => setValues(prev => ({ ...prev, [id]: v }))
    return { values, update }
}
