import { type ComponentType, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
    ActivityIcon,
    ArrowLeftIcon,
    BookOpenIcon,
    Building2Icon,
    GraduationCapIcon,
    MailIcon,
    MapPinIcon,
    MessageCircleIcon,
    PencilLineIcon,
    SparklesIcon,
    UserRoundIcon,
    AwardIcon,
    TrophyIcon,
    StarIcon,
    UsersIcon,
    ClockIcon,
    TrendingUpIcon,
    BotIcon,
    CalendarCheckIcon,
    BrainCircuitIcon,
    CheckCircle2Icon,
    FolderSymlinkIcon,
    FileTextIcon,
    LibraryIcon,
} from "lucide-react"

import {
    useStudentProfile,
    useStudentProfileByUsername,
} from "@/modules/profiles/api/hooks"
import { useFriendsRealtime } from "@/modules/user/api/hooks"
import { FriendshipButton } from "@/modules/user/ui/friendship-button"
import { useAuthUser } from "@/modules/auth/model/useAuthUser.ts"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { cn } from "@/shared/shadcn/lib/utils.ts"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"
import { ApiError } from "@/shared/types/api"

function getInitials(name: string) {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((item) => item[0] ?? "")
            .join("")
            .toUpperCase() || "U"
    )
}

function normalizeTelegramHandle(value: string | null) {
    if (!value) {
        return null
    }

    return value.replace(/^@/, "")
}

function resolveOnlineStatus(profile: unknown): boolean | null {
    if (!profile || typeof profile !== "object") {
        return null
    }

    const candidate = profile as { onlineStatus?: boolean | null; online_status?: boolean | null }
    return candidate.onlineStatus ?? candidate.online_status ?? null
}

function StatsCard({
                       icon: Icon,
                       label,
                       value,
                       trend,
                   }: {
    icon: ComponentType<{ className?: string }>
    label: string
    value: string | number
    trend?: string
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-background/95 to-muted/30 p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                        <Icon className="size-5 text-primary" />
                    </div>
                    {trend && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {trend}
                        </span>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                </div>
            </div>
        </div>
    )
}

function TimelineItem({
                          icon: Icon,
                          title,
                          subtitle,
                          date,
                          isLast = false,
                      }: {
    icon: ComponentType<{ className?: string }>
    title: string
    subtitle?: string
    date?: string
    isLast?: boolean
}) {
    return (
        <div className="relative flex gap-4 pb-8">
            {!isLast && (
                <div className="absolute left-[19px] top-[42px] h-full w-[2px] bg-gradient-to-b from-border to-transparent" />
            )}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-background shadow-sm">
                <Icon className="size-4 text-primary" />
            </div>
            <div className="flex-1 pt-1">
                <h4 className="font-semibold leading-tight">{title}</h4>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                {date && (
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                        {date}
                    </p>
                )}
            </div>
        </div>
    )
}

function QuickAction({
                         icon: Icon,
                         label,
                         onClick,
                     }: {
    icon: ComponentType<{ className?: string }>
    label: string
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-4 py-3 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
        >
            <div className="rounded-lg bg-muted p-2 transition-colors duration-200 group-hover:bg-primary/10">
                <Icon className="size-5 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-center">{label}</span>
        </button>
    )
}

function ProfilePageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 py-12">
            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <Skeleton className="h-[600px] w-full rounded-3xl" />
                </div>
                <div className="lg:col-span-8">
                    <Skeleton className="h-[600px] w-full rounded-3xl" />
                </div>
            </div>
        </div>
    )
}

export function ProfilePage() {
    const { username } = useParams<{ username: string }>()
    const currentUser = useAuthUser()
    const requestedUsername = username?.trim() || null
    const foreignUsername =
        requestedUsername && requestedUsername !== currentUser?.username
            ? requestedUsername
            : null
    const isForeignProfile = Boolean(foreignUsername)
    const [activeTab, setActiveTab] = useState<"overview" | "activity" | "achievements">("overview")

    usePageTitle(
        isForeignProfile ? `Профіль @${foreignUsername}` : "Мій профіль",
        { suffix: true },
    )

    const ownProfileQuery = useStudentProfile(!isForeignProfile)
    const foreignProfileQuery = useStudentProfileByUsername(foreignUsername)
    useFriendsRealtime(isForeignProfile)

    const profile = isForeignProfile ? foreignProfileQuery.data : ownProfileQuery.data
    const profileError = isForeignProfile ? foreignProfileQuery.error : ownProfileQuery.error
    const isLoading = isForeignProfile
        ? foreignProfileQuery.isLoading
        : ownProfileQuery.isLoading
    const isError = isForeignProfile ? foreignProfileQuery.isError : ownProfileQuery.isError
    const isForbiddenProfile = profileError instanceof ApiError && profileError.isForbidden

    if (isLoading) {
        return <ProfilePageSkeleton />
    }

    if (isError || !profile) {
        return (
            <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center py-16">
                <div className="w-full space-y-6 p-12 text-center">
                    <div className="mx-auto size-20 rounded-full flex items-center justify-center">
                        <UserRoundIcon className="size-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isForbiddenProfile ? "Профіль закритий" : "Профіль не знайдено"}
                        </h1>
                        <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
                            {isForbiddenProfile
                                ? (profileError.body.message || "Студент обмежив доступ до свого профілю.")
                                : "Можливо, студент змінив username або такого профілю ще не існує."}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="lg" className="rounded-full">
                        <Link to="/dashboard/profile">
                            <ArrowLeftIcon className="mr-2 size-4" />
                            Повернутися до мого профілю
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    const profileUser = profile.user ?? currentUser
    const userName =
        [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(" ") || "Студент"
    const avatarUrl = profileUser?.avatarPath ?? profile.profileImage ?? ""
    const about = profile.bio ?? (isForeignProfile
        ? "Цей студент ще не додав опис профілю."
        : "Додай опис, щоб одногрупникам було простіше знайти з тобою спільну мову.")
    const telegramHandle = normalizeTelegramHandle(profile.telegram)
    const telegramUrl = telegramHandle ? `https://t.me/${telegramHandle}` : null
    const city = profile.city ?? "—"
    const email = profileUser?.email ?? "—"
    const university = profile.university
    const onlineStatus = resolveOnlineStatus(profile)

    return (
        <div className="min-h-screen">
            {/* Header Area */}
            <div className="relative overflow-hidden border-b">
                <div className="relative mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-full"
                        >
                            <Link to="/dashboard">
                                <ArrowLeftIcon className="mr-2 size-4" />
                                Назад
                            </Link>
                        </Button>

                        {!isForeignProfile && (
                            <div className="flex gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    <Link to="/dashboard/settings?tab=account">
                                        Налаштування
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="rounded-full shadow-sm"
                                >
                                    <Link to="/dashboard/settings?tab=profile">
                                        <PencilLineIcon className="mr-2 size-4" />
                                        Редагувати
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 space-y-6">
                            {/* Main Profile Card */}
                            <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                                <div className="relative p-8">
                                    <div className="relative mx-auto mb-6 w-fit">
                                        <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl" />
                                        <Avatar className="relative size-32 rounded-full border-4 border-background shadow-2xl ring-2 ring-primary/10">
                                            <AvatarImage src={avatarUrl} alt={userName} />
                                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-3xl font-bold">
                                                {getInitials(userName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {onlineStatus && (
                                            <div className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-background bg-emerald-500 shadow-lg" />
                                        )}
                                    </div>

                                    <div className="text-center space-y-3">
                                        <div>
                                            <h1 className="text-2xl font-bold tracking-tight">{userName}</h1>
                                            {profileUser?.username && (
                                                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                                                    @{profileUser.username}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-full px-3 py-1 text-xs font-medium"
                                            >
                                                <SparklesIcon className="mr-1.5 size-3" />
                                                {isForeignProfile ? "Студент" : "Мій профіль"}
                                            </Badge>
                                            {onlineStatus !== null && (
                                                <Badge
                                                    variant={onlineStatus ? "default" : "outline"}
                                                    className="rounded-full px-3 py-1 text-xs"
                                                >
                                                    <ActivityIcon className="mr-1.5 size-3" />
                                                    {onlineStatus ? "Онлайн" : "Офлайн"}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm leading-relaxed text-muted-foreground px-2">
                                            {about}
                                        </p>
                                    </div>

                                    {isForeignProfile && (
                                        <div className="mt-6 space-y-3">
                                            {profileUser?.id && (
                                                <FriendshipButton userId={profileUser.id} />
                                            )}
                                            {telegramUrl && (
                                                <Button
                                                    asChild
                                                    className="w-full rounded-full shadow-sm"
                                                    variant="secondary"
                                                >
                                                    <a href={telegramUrl} target="_blank" rel="noreferrer">
                                                        <MessageCircleIcon className="mr-2 size-4" />
                                                        Написати в Telegram
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="rounded-lg bg-muted/50 p-2">
                                                <MailIcon className="size-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">{email}</p>
                                            </div>
                                        </div>
                                        {city !== "—" && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="rounded-lg bg-muted/50 p-2">
                                                    <MapPinIcon className="size-4 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">{city}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Univa Quick Actions */}
                            <div className="rounded-3xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm">
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Екосистема
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <QuickAction icon={MessageCircleIcon} label="Чат" />
                                    <QuickAction icon={FolderSymlinkIcon} label="Спільні файли" />
                                    <QuickAction icon={UsersIcon} label="У групу" />
                                </div>
                            </div>

                            {/* Univa Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <StatsCard icon={CalendarCheckIcon} label="Дедлайни" value="42" trend="Закрито" />
                                <StatsCard icon={BrainCircuitIcon} label="AI-асистент" value="1.2K" trend="Запитів" />
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-8">
                        <div className="space-y-8">
                            {/* Tab Navigation */}
                            <div className="rounded-2xl border border-border/50 bg-card/50 p-2 backdrop-blur-sm">
                                <div className="flex gap-2">
                                    {[
                                        { id: "overview", label: "Навчання", icon: BookOpenIcon },
                                        { id: "activity", label: "Активність", icon: ClockIcon },
                                        { id: "achievements", label: "Досягнення", icon: TrophyIcon },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={cn(
                                                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                                activeTab === tab.id
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                        >
                                            <tab.icon className="size-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {activeTab === "overview" && (
                                <>
                                    {/* University Module */}
                                    {university ? (
                                        <div className="rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm">
                                            <div className="mb-6 flex items-center gap-3">
                                                <div className="rounded-2xl bg-primary/10 p-3">
                                                    <Building2Icon className="size-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold">Університет</h2>
                                                    <p className="text-sm text-muted-foreground">
                                                        Академічне середовище
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-background/80 to-muted/20 p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="rounded-xl bg-muted/50 p-3">
                                                            <GraduationCapIcon className="size-6 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold leading-tight">
                                                                {university.name ?? "Університет"}
                                                            </h3>
                                                            {university.shortName && (
                                                                <p className="mt-1 text-sm font-medium text-muted-foreground">
                                                                    {university.shortName}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="rounded-2xl border border-border/40 bg-background/50 p-5">
                                                        <div className="mb-3 rounded-lg bg-primary/10 p-2 w-fit">
                                                            <LibraryIcon className="size-5 text-primary" />
                                                        </div>
                                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                            Факультет
                                                        </p>
                                                        <p className="mt-2 font-semibold">
                                                            {university.facultyName ?? "—"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-border/40 bg-background/50 p-5">
                                                        <div className="mb-3 rounded-lg bg-primary/10 p-2 w-fit">
                                                            <UsersIcon className="size-5 text-primary" />
                                                        </div>
                                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                            Група
                                                        </p>
                                                        <p className="mt-2 font-semibold">
                                                            {university.groupCode ?? "—"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-border/40 bg-background/50 p-5">
                                                        <div className="mb-3 rounded-lg bg-primary/10 p-2 w-fit">
                                                            <TrendingUpIcon className="size-5 text-primary" />
                                                        </div>
                                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                            Курс
                                                        </p>
                                                        <p className="mt-2 font-semibold">
                                                            {university.courseLabel ??
                                                                (university.course ? `${university.course}` : "—")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border-2 border-dashed border-border/60 bg-muted/10 p-12 text-center">
                                            <div className="mx-auto mb-4 w-fit rounded-full bg-muted/50 p-4">
                                                <GraduationCapIcon className="size-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold">Освітній профіль не заповнений</h3>
                                            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                                                {isForeignProfile
                                                    ? "Студент ще не додав інформацію про навчання."
                                                    : "Додай університет, щоб AI міг краще адаптувати матеріали."}
                                            </p>
                                            {!isForeignProfile && (
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="mt-6 rounded-full"
                                                >
                                                    <Link to="/dashboard/settings?tab=profile">
                                                        Налаштувати навчання
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Univa Specific Modules Grid */}
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Study Progress / Subjects */}
                                        <div className="rounded-3xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-xl bg-primary/10 p-2">
                                                    <BookOpenIcon className="size-5 text-primary" />
                                                </div>
                                                <h3 className="font-semibold">Прогрес семестру</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { name: "Вища математика", progress: 85, tasks: "12/14" },
                                                    { name: "Алгоритми та структури", progress: 60, tasks: "5/8" },
                                                    { name: "Бази даних", progress: 95, tasks: "10/10" },
                                                ].map((subject) => (
                                                    <div key={subject.name}>
                                                        <div className="mb-1 flex justify-between text-sm">
                                                            <span className="font-medium">{subject.name}</span>
                                                            <span className="text-muted-foreground text-xs">{subject.tasks} робіт</span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                                                                style={{ width: `${subject.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Study Interests / AI Context */}
                                        <div className="rounded-3xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm flex flex-col">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-xl bg-primary/10 p-2">
                                                    <StarIcon className="size-5 text-primary" />
                                                </div>
                                                <h3 className="font-semibold">Сфера інтересів</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {["Web Development", "AI/ML", "UI/UX", "Productivity"].map((interest) => (
                                                    <Badge
                                                        key={interest}
                                                        variant="secondary"
                                                        className="rounded-full px-3 py-1"
                                                    >
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-auto rounded-xl bg-primary/5 border border-primary/10 p-4">
                                                <div className="flex items-start gap-3">
                                                    <BotIcon className="size-5 text-primary shrink-0 mt-0.5" />
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        AI враховує ці теги для персоналізації навчального плану та підбору матеріалів.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === "activity" && (
                                <div className="rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary/10 p-3">
                                            <ActivityIcon className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Журнал екосистеми</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Взаємодія з платформою
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <TimelineItem
                                            icon={CheckCircle2Icon}
                                            title="Закрито дедлайн"
                                            subtitle="Лабораторна робота №3 з Баз Даних"
                                            date="Сьогодні, 14:30"
                                        />
                                        <TimelineItem
                                            icon={BotIcon}
                                            title="Згенеровано AI-конспект"
                                            subtitle="Тема: 'Архітектура REST API'"
                                            date="Вчора"
                                        />
                                        <TimelineItem
                                            icon={FileTextIcon}
                                            title="Завантажено файл"
                                            subtitle="presentation_final.pdf додано у спільний простір"
                                            date="2 дні тому"
                                        />
                                        <TimelineItem
                                            icon={UsersIcon}
                                            title="Створено груповий простір"
                                            subtitle="Команда розробки курсового проєкту"
                                            date="Минулого тижня"
                                            isLast
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "achievements" && (
                                <div className="rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary/10 p-3">
                                            <AwardIcon className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Гейміфікація навчання</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Відзнаки за продуктивність
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {[
                                            {
                                                icon: CalendarCheckIcon,
                                                title: "Володар дедлайнів",
                                                description: "50 завдань здано достроково",
                                                unlocked: true,
                                            },
                                            {
                                                icon: BrainCircuitIcon,
                                                title: "Симбіоз з AI",
                                                description: "Згенеровано 100 конспектів",
                                                unlocked: true,
                                            },
                                            {
                                                icon: UsersIcon,
                                                title: "Командний гравець",
                                                description: "Участь у 5+ групових просторах",
                                                unlocked: true,
                                            },
                                            {
                                                icon: LibraryIcon,
                                                title: "Амбасадор бібліотеки",
                                                description: "Завантажено 50 матеріалів",
                                                unlocked: false,
                                            },
                                        ].map((achievement, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "rounded-2xl border p-5 transition-all duration-200",
                                                    achievement.unlocked
                                                        ? "border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg"
                                                        : "border-border/30 bg-muted/20 opacity-60"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={cn(
                                                            "rounded-xl p-3",
                                                            achievement.unlocked
                                                                ? "bg-primary/20"
                                                                : "bg-muted/50"
                                                        )}
                                                    >
                                                        <achievement.icon
                                                            className={cn(
                                                                "size-6",
                                                                achievement.unlocked
                                                                    ? "text-primary"
                                                                    : "text-muted-foreground"
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{achievement.title}</h4>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {achievement.description}
                                                        </p>
                                                        {achievement.unlocked && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="mt-3 rounded-full px-2 py-0.5 text-xs"
                                                            >
                                                                Отримано
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}