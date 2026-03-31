import {
    BotIcon,
    BrainCircuitIcon,
    CalendarRangeIcon,
    FileTextIcon,
    GraduationCapIcon,
    LayoutDashboardIcon,
    SparklesIcon,
    UsersIcon,
} from "lucide-react"
import type { ProfileViewModel } from "@/modules/profiles/model/types"
import { ProfileHeroCard } from "../components/profile-hero-card"
import { ProfileSectionCard } from "../components/profile-section-card"
import { FeatureCard } from "./feature-card"

export function ProfileUnivaView({ viewModel }: { viewModel: ProfileViewModel }) {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                {/* Left column */}
                <div className="space-y-4">
                    <ProfileHeroCard
                        viewModel={viewModel}
                        accentLabel="Univa"
                    />

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: "4+", label: "Модулі" },
                            { value: "AI", label: "Асистент" },
                            { value: "∞", label: "Файли" },
                            { value: "24/7", label: "Доступ" },
                        ].map(({ value, label }) => (
                            <div
                                key={label}
                                className="rounded-xl border border-border/40 bg-card px-4 py-3 text-center shadow-sm"
                            >
                                <p className="text-lg font-bold tracking-tight">{value}</p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Hero */}
                    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-7 shadow-sm">
                        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute -bottom-6 left-10 size-28 rounded-full bg-primary/8 blur-2xl" />
                        <div className="relative">
                            <div className="mb-2 flex items-center gap-2">
                                <SparklesIcon className="size-4 text-primary" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                                    Навчальна платформа
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Univa</h2>
                            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                                Все що потрібно студенту — розклад, дедлайни, файли, групи та AI в одному місці.
                            </p>
                        </div>
                    </div>

                    {/* Modules */}
                    <ProfileSectionCard title="Що є на платформі">
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                            {[
                                { icon: LayoutDashboardIcon, label: "Дашборд", sub: "Огляд усього" },
                                { icon: CalendarRangeIcon, label: "Розклад", sub: "Пари і дедлайни" },
                                { icon: FileTextIcon, label: "Файли", sub: "Матеріали" },
                                { icon: BrainCircuitIcon, label: "AI", sub: "Асистент" },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div
                                    key={label}
                                    className="group flex flex-col items-center gap-2 rounded-xl border border-border/30 bg-muted/10 py-4 text-center transition-colors hover:bg-muted/20"
                                >
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                                        <Icon className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold">{label}</p>
                                        <p className="text-[10px] text-muted-foreground">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ProfileSectionCard>

                    {/* Feature cards */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FeatureCard
                            icon={SparklesIcon}
                            title="AI-асистент"
                            text="Відповідає на питання, допомагає з навчанням і розуміє контекст твого розкладу."
                            accent
                        />
                        <FeatureCard
                            icon={UsersIcon}
                            title="Групова робота"
                            text="Спільні задачі, файли та чати для навчальних груп і команд."
                        />
                        <FeatureCard
                            icon={GraduationCapIcon}
                            title="Дедлайни"
                            text="Не пропускай здачі. Платформа слідкує за строками і нагадує вчасно."
                        />
                        <FeatureCard
                            icon={BotIcon}
                            title="Автоматизація"
                            text="Розклад синхронізується і оновлюється без зайвих дій."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
