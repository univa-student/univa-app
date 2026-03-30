import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Button } from "@/shared/shadcn/ui/button"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"
import { Toggle } from "../ui/settings.toggle"
import { containerAnim, itemAnim } from "../ui/settings.animations"
import { SETTING_VALUE_ICON_MAP } from "../model/settings.icon-map"
import type { SettingItem, SettingValue } from "@/modules/settings/api/settings.api"
import { getSelectedValue } from "@/modules/settings/api/settings.api"
import type { LucideIcon } from "lucide-react"
import { AlertTriangleIcon, LoaderCircleIcon, SaveIcon } from "lucide-react"
import React from "react";


interface DynamicSettingsCardProps {
    title: string
    description?: string
    icon?: LucideIcon
    settings: SettingItem[]
    draft: Record<string, string>
    onChange: (key: string, value: string) => void
    enumColumns?: 2 | 3
}

export function DynamicSettingsCard({
    title, description, icon: Icon, settings, draft, onChange, enumColumns,
}: DynamicSettingsCardProps) {
    const bools = settings.filter(s => s.type === "bool")
    const enums = settings.filter(s => s.type === "enum")

    return (
        <motion.div variants={itemAnim}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {Icon && <Icon className="size-5 text-primary" />}
                        {title}
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    {/* Enum selectors */}
                    {enums.map((s, idx) => (
                        <div key={s.key}>
                            {idx > 0 && <Separator className="mb-5" />}
                            <EnumSettingRow
                                item={s}
                                selected={draft[s.key] ?? getSelectedValue(s)}
                                onChange={v => onChange(s.key, v)}
                                columns={enumColumns}
                            />
                        </div>
                    ))}

                    {bools.length > 0 && enums.length > 0 && <Separator />}
                    {bools.map((s, idx) => (
                        <div key={s.key}>
                            {idx > 0 && <Separator className="mb-4" />}
                            <BoolSettingRow
                                item={s}
                                checked={draft[s.key] !== undefined
                                    ? draft[s.key] === "1"
                                    : getSelectedValue(s) === "1"}
                                onChange={v => onChange(s.key, v ? "1" : "0")}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    )
}

function BoolSettingRow({ item, checked, onChange }: {
    item: SettingItem
    checked: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium">{item.label}</p>
                {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
            </div>
            <Toggle checked={checked} onChange={onChange} label={item.label} />
        </div>
    )
}

function EnumSettingRow({ item, selected, onChange, columns }: {
    item: SettingItem
    selected: string
    onChange: (v: string) => void
    columns?: 2 | 3
}) {
    const cols = columns ?? (item.values.length <= 2 ? 2 : 3)
    const gridCls = cols === 2 ? "grid-cols-2" : "grid-cols-3"

    return (
        <div>
            <p className="text-sm font-medium mb-2">{item.label}</p>
            {item.description && (
                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
            )}
            <div className={`grid ${gridCls} gap-3`}>
                {item.values.map(opt => (
                    <EnumOption
                        key={opt.id}
                        option={opt}
                        isActive={selected === opt.value}
                        onClick={() => onChange(opt.value)}
                    />
                ))}
            </div>
        </div>
    )
}

function EnumOption({ option, isActive, onClick }: {
    option: SettingValue
    isActive: boolean
    onClick: () => void
}) {
    const Icon = SETTING_VALUE_ICON_MAP[option.value]
    const base = "rounded-lg border transition-all cursor-pointer"
    const active = isActive
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border hover:border-muted-foreground/30"

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 ${base} ${active}`}
        >
            {Icon && (
                <div className="flex size-10 items-center justify-center rounded-md bg-secondary">
                    <Icon className="size-5 text-muted-foreground" />
                </div>
            )}
            <p className="text-sm font-medium">{option.label}</p>
        </button>
    )
}

interface TabShellProps {
    children: React.ReactNode
    showSave?: boolean
    onSave?: () => void
    onCancel?: () => void
    isSaving?: boolean
    isDirty?: boolean
    error?: string | null
    dirtyMessage?: string
    canSave?: boolean
}

export function TabShell({ children, showSave = true, onSave, onCancel, isSaving, isDirty, error, dirtyMessage = "Є незбережені зміни", canSave = true }: TabShellProps) {
    return (
        <div className="relative pb-24">
            <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
                {children}
            </motion.div>
            
            {showSave && (
                <AnimatePresence>
                    {isDirty && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 h-14 w-[36rem] mx-auto"
                        >
                            <Card className="shadow-lg border-primary/20">
                                <CardContent className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlertTriangleIcon className="size-4 text-amber-500" />
                                        <span className="font-medium text-foreground">
                                            {dirtyMessage}
                                        </span>
                                    </div>
                                    {error && (
                                        <div className="text-sm text-destructive font-medium border-l border-destructive/50 pl-3 ml-2">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex gap-2 ml-4">
                                        {onCancel && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={onCancel}
                                                disabled={isSaving}
                                            >
                                                Скасувати
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={onSave}
                                            disabled={isSaving || !canSave}
                                        >
                                            {isSaving ? (
                                                <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
                                            ) : (
                                                <SaveIcon className="mr-2 size-4" />
                                            )}
                                            Зберегти
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}


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
