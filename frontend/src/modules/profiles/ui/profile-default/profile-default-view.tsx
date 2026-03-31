import { useState } from "react"
import {
    AwardIcon,
    BookOpenIcon,
    CheckCircle2Icon,
    ClockIcon,
    GraduationCapIcon,
    LibraryIcon,
    TrophyIcon,
    UsersIcon,
} from "lucide-react"
import type { ProfileViewModel } from "@/modules/profiles/model/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs"
import { ProfileHeroCard } from "../components/profile-hero-card"
import { ProfileSectionCard } from "../components/profile-section-card"
import { ProfileStatGrid } from "../components/profile-stat-grid"
import { ProfileFact } from "./profile-fact"
import { EmptyEducationState } from "./empty-education-state"
import { TimelineRow } from "./timeline-row"

export function ProfileDefaultView({ viewModel }: { viewModel: ProfileViewModel }) {
    const [activeTab, setActiveTab] = useState("overview")
    const university = viewModel.profile.university
    const completion = viewModel.profile.completion

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                {/* Left column */}
                <div className="space-y-4">
                    <ProfileHeroCard
                        viewModel={viewModel}
                        accentLabel={viewModel.isOwnProfile ? "Мій профіль" : "Профіль студента"}
                    />

                    {/* Completion pill */}
                    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Заповненість профілю
                            </p>
                            <span className="text-sm font-semibold tabular-nums">{completion.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                                style={{ width: `${completion.percent}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {completion.filled} з {completion.total} полів заповнено
                        </p>
                    </div>

                    {/* University quick stats */}
                    {university && (
                        <ProfileSectionCard title="Навчання">
                            <ProfileStatGrid
                                items={[
                                    {
                                        icon: GraduationCapIcon,
                                        label: "Курс",
                                        value: university.courseLabel ?? (university.course ? `${university.course} курс` : "—"),
                                    },
                                    {
                                        icon: BookOpenIcon,
                                        label: "Група",
                                        value: university.groupCode ?? "—",
                                    },
                                ]}
                            />
                        </ProfileSectionCard>
                    )}
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="h-9 w-full rounded-xl bg-muted/50 p-1">
                            <TabsTrigger value="overview" className="rounded-lg text-xs flex-1">Огляд</TabsTrigger>
                            <TabsTrigger value="activity" className="rounded-lg text-xs flex-1">Активність</TabsTrigger>
                            <TabsTrigger value="achievements" className="rounded-lg text-xs flex-1">Відзнаки</TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW */}
                        <TabsContent value="overview" className="mt-0 space-y-4">
                            <ProfileSectionCard
                                title="Освітній профіль"
                                description="Університет, факультет і навчальний контекст."
                            >
                                {university ? (
                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                        <ProfileFact label="Університет" value={university.name ?? "—"} />
                                        <ProfileFact label="Факультет" value={university.facultyName ?? "—"} />
                                        <ProfileFact label="Група" value={university.groupCode ?? "—"} />
                                        <ProfileFact
                                            label="Тип профілю"
                                            value={viewModel.profile.profileType === "univa" ? "Univa" : "Стандартний"}
                                        />
                                    </div>
                                ) : (
                                    <EmptyEducationState isOwnProfile={viewModel.isOwnProfile} />
                                )}
                            </ProfileSectionCard>

                            <ProfileSectionCard title="Публічна інформація">
                                <div className="flex flex-wrap gap-2">
                                    <InfoTag label="Email" />
                                    <InfoTag label="Місто" />
                                    <InfoTag label="Університет" />
                                    {viewModel.telegramUrl && <InfoTag label="Telegram" />}
                                </div>
                            </ProfileSectionCard>
                        </TabsContent>

                        {/* ACTIVITY */}
                        <TabsContent value="activity" className="mt-0 space-y-4">
                            <ProfileSectionCard title="Остання активність">
                                <div className="divide-y divide-border/20">
                                    <div className="pb-1">
                                        <TimelineRow
                                            icon={CheckCircle2Icon}
                                            title="Оновлено профіль"
                                            subtitle="Опис і контакти синхронізовано з акаунтом."
                                        />
                                    </div>
                                    <div className="py-1">
                                        <TimelineRow
                                            icon={BookOpenIcon}
                                            title="Оновлено освітній контекст"
                                            subtitle="Прив'язано до актуального місця навчання."
                                        />
                                    </div>
                                    <div className="pt-1">
                                        <TimelineRow
                                            icon={UsersIcon}
                                            title="Профіль у спільноті"
                                            subtitle="Інші знаходять вас за username."
                                        />
                                    </div>
                                </div>
                            </ProfileSectionCard>
                        </TabsContent>

                        {/* ACHIEVEMENTS */}
                        <TabsContent value="achievements" className="mt-0 space-y-4">
                            <ProfileSectionCard title="Досягнення">
                                <ProfileStatGrid
                                    cols={4}
                                    items={[
                                        {
                                            icon: AwardIcon,
                                            label: "Заповнення",
                                            value: `${completion.filled}/${completion.total}`,
                                        },
                                        {
                                            icon: TrophyIcon,
                                            label: "Статус",
                                            value: completion.percent >= 80 ? "Готово" : "В процесі",
                                        },
                                        {
                                            icon: ClockIcon,
                                            label: "Профіль",
                                            value: viewModel.isOwnProfile ? "Активний" : "Публічний",
                                        },
                                        {
                                            icon: LibraryIcon,
                                            label: "Режим",
                                            value: "Стандартний",
                                        },
                                    ]}
                                />
                            </ProfileSectionCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function InfoTag({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40">
            {label}
        </span>
    )
}
