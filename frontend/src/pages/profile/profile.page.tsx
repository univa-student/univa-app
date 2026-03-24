import React, { type ComponentType } from "react"
import { Link, useParams } from "react-router-dom"
import {
    ArrowLeftIcon,
    BookOpenIcon,
    Building2Icon,
    CalendarDaysIcon,
    GraduationCapIcon,
    MailIcon,
    MapPinIcon,
    MessageCircleIcon,
    PencilLineIcon,
    PhoneIcon,
    SparklesIcon,
    UserRoundIcon,
} from "lucide-react"

import { useAuthUser } from "@/modules/auth/model/useAuthUser"
import {
    useStudentProfile,
    useStudentProfileByUsername,
} from "@/modules/profiles/api/hooks"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { cn } from "@/shared/shadcn/lib/utils.ts"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { Progress } from "@/shared/shadcn/ui/progress"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"

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

function formatBirthDate(value: string | null) {
    if (!value) {
        return "—"
    }

    return new Date(value).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function normalizeTelegramHandle(value: string | null) {
    if (!value) {
        return null
    }

    return value.replace(/^@/, "")
}

function SectionCard({
    title,
    description,
    children,
    className,
}: {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <section
            className={cn(
                "rounded-3xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm",
                className,
            )}
        >
            <div className="mb-4">
                <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
                {description ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                ) : null}
            </div>

            {children}
        </section>
    )
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/70 px-3 py-3 transition-colors hover:bg-muted/40">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    )
}

function ProfilePageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 py-8">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-72 w-full rounded-3xl lg:col-span-2" />
                <Skeleton className="h-72 w-full rounded-3xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl" />
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

    usePageTitle(
        isForeignProfile ? `Профіль @${foreignUsername}` : "Мій профіль",
        { suffix: true },
    )

    const ownProfileQuery = useStudentProfile(!isForeignProfile)
    const foreignProfileQuery = useStudentProfileByUsername(foreignUsername)

    const profile = isForeignProfile ? foreignProfileQuery.data : ownProfileQuery.data
    const isLoading = isForeignProfile
        ? foreignProfileQuery.isLoading
        : ownProfileQuery.isLoading
    const isError = isForeignProfile ? foreignProfileQuery.isError : ownProfileQuery.isError

    if (isLoading) {
        return <ProfilePageSkeleton />
    }

    if (isError || !profile) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center py-10">
                <div className="w-full rounded-[2rem] border border-dashed border-border/70 bg-card/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight">Профіль не знайдено</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Можливо, користувач змінив username або такого профілю ще не існує.
                    </p>
                    <div className="mt-5 flex justify-center">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link to="/dashboard/profile">
                                <ArrowLeftIcon className="mr-2 size-4" />
                                Повернутися до мого профілю
                            </Link>
                        </Button>
                    </div>
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
        : "Профіль ще не має опису.")
    const telegramHandle = normalizeTelegramHandle(profile.telegram)
    const telegram = telegramHandle ? `@${telegramHandle}` : "—"
    const telegramUrl = telegramHandle ? `https://t.me/${telegramHandle}` : null
    const city = profile.city ?? "—"
    const birthDate = formatBirthDate(profile.birthDate)
    const phone = profile.phone ?? "—"
    const email = profileUser?.email ?? "—"
    const publicUsername = profileUser?.username ? `@${profileUser.username}` : "—"
    const university = profile.university
    const completion = profile.completion.percent

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 py-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.10),transparent_35%)]" />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />

                <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                            <Avatar className="size-20 rounded-3xl border-4 border-background shadow-md sm:size-24">
                                <AvatarImage src={avatarUrl} alt={userName} />
                                <AvatarFallback className="rounded-3xl bg-muted text-xl font-semibold">
                                    {getInitials(userName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="rounded-full px-3 py-1 text-[11px] font-medium"
                                        >
                                            <SparklesIcon className="mr-1 size-3.5" />
                                            {isForeignProfile ? "Профіль студента" : "Мій профіль"}
                                        </Badge>

                                        {profileUser?.username ? (
                                            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                                                @{profileUser.username}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    <div>
                                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                            {userName}
                                        </h1>
                                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                            {about}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                            {isForeignProfile ? (
                                <>
                                    {telegramUrl ? (
                                        <Button asChild className="rounded-xl shadow-sm">
                                            <a href={telegramUrl} target="_blank" rel="noreferrer">
                                                <MessageCircleIcon className="mr-2 size-4" />
                                                Написати в Telegram
                                            </a>
                                        </Button>
                                    ) : null}

                                    <Button asChild variant="outline" className="rounded-xl">
                                        <Link to="/dashboard/profile">
                                            <ArrowLeftIcon className="mr-2 size-4" />
                                            Мій профіль
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button asChild variant="outline" className="rounded-xl">
                                        <Link to="/dashboard/settings?tab=account">Налаштування</Link>
                                    </Button>

                                    <Button asChild className="rounded-xl shadow-sm">
                                        <Link to="/dashboard/settings?tab=profile">
                                            <PencilLineIcon className="mr-2 size-4" />
                                            Редагувати профіль
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                <SectionCard
                    title="Контакти"
                    description={isForeignProfile
                        ? "Дані, за якими можна зв’язатися зі студентом."
                        : "Основні способи швидко зв’язатися з вами."}
                    className="lg:col-span-1"
                >
                    <div className="space-y-3">
                        <InfoItem icon={MailIcon} label="Email" value={email} />
                        <InfoItem icon={PhoneIcon} label="Телефон" value={phone} />
                        <a href={telegramUrl} target="_blank" rel="noreferrer">
                            <InfoItem icon={UserRoundIcon} label="Telegram" value={telegram} />
                        </a>
                    </div>
                </SectionCard>

                <SectionCard
                    title="Особисті дані"
                    description="Базова персональна інформація профілю."
                    className="lg:col-span-2"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InfoItem icon={CalendarDaysIcon} label="Дата народження" value={birthDate} />
                        <InfoItem icon={MapPinIcon} label="Місто" value={city} />
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                title="Освіта"
                description="Навчальний профіль та інформація про університет."
            >
                {university ? (
                    <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/70">
                        <div className="border-b border-border/60 px-5 py-5">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                                    <Building2Icon className="size-5 text-muted-foreground" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold leading-snug">
                                        {university.name ?? "Університет"}
                                    </p>

                                    {university.shortName ? (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {university.shortName}
                                        </p>
                                    ) : null}

                                    {university.location ? (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {university.location}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 p-5 md:grid-cols-3">
                            <InfoItem
                                icon={BookOpenIcon}
                                label="Факультет"
                                value={university.facultyName ?? "—"}
                            />

                            <InfoItem
                                icon={GraduationCapIcon}
                                label="Група"
                                value={university.groupCode ?? "—"}
                            />

                            <InfoItem
                                icon={CalendarDaysIcon}
                                label="Курс"
                                value={
                                    university.courseLabel ??
                                    (university.course ? `${university.course}` : "—")
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
                        <p className="text-sm font-medium">Освітній профіль ще не заповнений</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isForeignProfile
                                ? "Студент ще не додав університет, групу або іншу навчальну інформацію."
                                : "Додай університет, групу та інші дані, щоб профіль був повнішим."}
                        </p>

                        {!isForeignProfile ? (
                            <Button asChild variant="outline" className="mt-4 rounded-xl">
                                <Link to="/dashboard/settings?tab=profile">Додати інформацію</Link>
                            </Button>
                        ) : null}
                    </div>
                )}
            </SectionCard>
        </div>
    )
}
