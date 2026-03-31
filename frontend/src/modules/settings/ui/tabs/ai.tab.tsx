import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
    EyeIcon,
    EyeOffIcon,
    KeyRoundIcon,
    SparklesIcon,
    WandSparklesIcon,
} from "lucide-react"
import { useSettingsGroup } from "@/modules/settings/hooks/use-settings-group"
import { useSettingsDraft } from "@/modules/settings/hooks/use-settings-draft"
import type { TabDef } from "@/modules/settings/model/settings.types"
import { getSelectedValue } from "@/modules/settings/api/settings.api"
import { SettingsLoadingShell, TabShell } from "@/modules/settings/ui/settings.renderers"
import { itemAnim } from "@/modules/settings/ui/settings.animations"
import { motion } from "framer-motion"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Input } from "@/shared/shadcn/ui/input"
import { Separator } from "@/shared/shadcn/ui/separator"

const PROVIDER_META: Record<string, { title: string; hint: string }> = {
    gemini: {
        title: "Gemini",
        hint: "Системний дефолт для Univa. Якщо власний ключ не вказано, працює через системний Gemini 2.5 Flash Lite.",
    },
    openai: {
        title: "ChatGPT",
        hint: "Підійде, якщо ви хочете запускати AI через власний OpenAI ключ.",
    },
    anthropic: {
        title: "Claude",
        hint: "Для користувачів, які працюють через Anthropic API key.",
    },
}

export function AITab({ tab }: { tab: TabDef }) {
    const { data, isLoading } = useSettingsGroup(tab.groupId!)
    const { draft, set, isDirty, isSaving, error, onSave, seed } = useSettingsDraft(tab.groupId!)
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (data) seed(data) }, [data])

    const providerSetting = useMemo(
        () => data?.find((item) => item.key === "ai_provider") ?? null,
        [data],
    )

    const keySettings = useMemo(
        () => data?.filter((item) => item.key !== "ai_provider") ?? [],
        [data],
    )

    if (isLoading) return <SettingsLoadingShell />
    if (!data || !providerSetting) return null

    return (
        <TabShell showSave onSave={onSave} isSaving={isSaving} isDirty={isDirty} error={error}>
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <SparklesIcon className="size-5 text-primary" />
                            AI за замовчуванням
                        </CardTitle>
                        <CardDescription>
                            Univa запускає AI-сценарії через вибраного провайдера. Базовий системний режим працює на Gemini 2.5 Flash Lite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {providerSetting.values.map((option) => {
                            const provider = option.value
                            const meta = PROVIDER_META[provider]
                            const isActive = (draft[providerSetting.key] ?? getSelectedValue(providerSetting)) === provider

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => set(providerSetting.key, provider)}
                                    className={[
                                        "rounded-xl border px-4 py-3 text-left transition-colors",
                                        isActive
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border hover:border-muted-foreground/30",
                                    ].join(" ")}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{meta?.title ?? option.label}</span>
                                                {provider === "gemini" && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        Дефолт
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {meta?.hint ?? option.label}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <Badge className="shrink-0">
                                                Активно
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <KeyRoundIcon className="size-5 text-primary" />
                            Власні API ключі
                        </CardTitle>
                        <CardDescription>
                            Додайте свій ключ для Gemini, ChatGPT або Claude. Якщо поле порожнє, Univa використовує системний ключ.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {keySettings.map((setting, index) => {
                            const value = draft[setting.key] ?? getSelectedValue(setting)
                            const provider = providerForKey(setting.key)
                            const title = PROVIDER_META[provider]?.title ?? setting.label
                            const hint = PROVIDER_META[provider]?.hint ?? setting.description ?? ""
                            const isVisible = visibleKeys[setting.key] === true

                            return (
                                <div key={setting.id}>
                                    {index > 0 && <Separator className="mb-4" />}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">{title}</p>
                                                    <Badge variant={value ? "default" : "secondary"} className="text-[10px]">
                                                        {value ? "Власний ключ" : "Системний ключ"}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {setting.description ?? hint}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 shrink-0"
                                                onClick={() => toggleVisibility(setting.key, setVisibleKeys)}
                                                aria-label={isVisible ? "Сховати ключ" : "Показати ключ"}
                                            >
                                                {isVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                            </Button>
                                        </div>

                                        <Input
                                            type={isVisible ? "text" : "password"}
                                            value={value}
                                            onChange={(event) => set(setting.key, event.target.value)}
                                            placeholder={placeholderForProvider(provider)}
                                            autoComplete="off"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <WandSparklesIcon className="size-5 text-primary" />
                            Як це працює
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>Вибраний провайдер використовується для AI-конспектів, планування дня та інших AI-сценаріїв, якщо ви не вказали модель вручну.</p>
                        <p>Порожній ключ не блокує AI. У цьому випадку система автоматично падає назад на серверний ключ Univa.</p>
                    </CardContent>
                </Card>
            </motion.div>
        </TabShell>
    )
}

function providerForKey(key: string): string {
    if (key.includes("openai")) return "openai"
    if (key.includes("anthropic")) return "anthropic"
    return "gemini"
}

function placeholderForProvider(provider: string): string {
    return {
        gemini: "AIza...",
        openai: "sk-...",
        anthropic: "sk-ant-...",
    }[provider] ?? ""
}

function toggleVisibility(
    key: string,
    setVisibleKeys: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
    setVisibleKeys((current) => ({
        ...current,
        [key]: !current[key],
    }))
}
