import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/shared/shadcn/ui/input"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Alert, AlertDescription } from "@/shared/shadcn/ui/alert"
import {
    AlertCircleIcon,
    BookOpenIcon,
    CameraIcon,
    CheckCircle2Icon,
    GraduationCapIcon,
    Link2Icon,
    LoaderCircleIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
    SparklesIcon,
    Trash2Icon,
    AlertTriangleIcon,
} from "lucide-react"
import { useAuthUser } from "@/modules/auth/model/useAuthUser"
import { useUploadAvatar } from "@/modules/auth/api/hooks"
import {
    useProfileInformation,
    useRemoveStudentUniversity,
    useSaveStudentUniversity,
    useStudentProfile,
    useUniversitiesByRegion,
    useUniversityDetails,
    useUpdateStudentProfile,
} from "@/modules/profiles/api/hooks"
import type { StudentProfile } from "@/modules/profiles/model/types"
import type { TabDef } from "@/modules/settings/model/settings.types.ts"
import {
    itemAnim,
} from "@/modules/settings/ui/settings.animations.ts"
import { TabShell } from "@/modules/settings/ui/settings.renderers.tsx"

const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
const textAreaClassName = "flex min-h-[112px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
const emptyProfileForm = {
    bio: "",
    phone: "",
    telegram: "",
    city: "",
    birthDate: "",
}
const emptyEducationForm = {
    regionCode: "",
    universityId: "",
    specialityName: "",
    groupCode: "",
    course: "",
}

function mapProfileToForm(profile: StudentProfile) {
    return {
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
        telegram: profile.telegram ?? "",
        city: profile.city ?? "",
        birthDate: profile.birthDate ?? "",
    }
}

function mapProfileToEducationForm(profile: StudentProfile) {
    return {
        regionCode: profile.university?.regionCode ?? "",
        universityId: profile.university?.externalId ?? "",
        specialityName: profile.university?.facultyName ?? "",
        groupCode: profile.university?.groupCode ?? "",
        course: profile.university?.course?.toString() ?? "",
    }
}

function extractErrorMessage(error: unknown, fallback: string) {
    return ((error as Error & { body?: { message?: string } })?.body?.message ?? fallback)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProfileTab(_: { tab: TabDef }) {
    const user = useAuthUser()
    const { data: profile } = useStudentProfile()
    const { data: profileInformation } = useProfileInformation()
    const updateProfile = useUpdateStudentProfile()
    const saveUniversity = useSaveStudentUniversity()
    const removeUniversity = useRemoveStudentUniversity()
    const uploadAvatar = useUploadAvatar()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const hasSeededProfile = useRef(false)

    const initials = [user?.firstName?.[0], user?.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ")

    const [form, setForm] = useState(emptyProfileForm)
    const [educationForm, setEducationForm] = useState(emptyEducationForm)
    const [universityQuery, setUniversityQuery] = useState("")
    const [initialUniversityQuery, setInitialUniversityQuery] = useState("")

    // Track initial values to detect changes
    const [initialForm, setInitialForm] = useState(form)
    const [initialEducationForm, setInitialEducationForm] = useState(educationForm)

    // Success message timers
    const [showProfileSuccess, setShowProfileSuccess] = useState(false)
    const [showEducationSuccess, setShowEducationSuccess] = useState(false)

    useEffect(() => {
        if (!profile || hasSeededProfile.current) return

        const nextForm = mapProfileToForm(profile)
        const nextEducationForm = mapProfileToEducationForm(profile)
        const nextUniversityQuery = profile.university?.name ?? ""

        setForm(nextForm)
        setInitialForm(nextForm)
        setEducationForm(nextEducationForm)
        setInitialEducationForm(nextEducationForm)
        setUniversityQuery(nextUniversityQuery)
        setInitialUniversityQuery(nextUniversityQuery)
        hasSeededProfile.current = true
    }, [profile])

    const { data: universities, isFetching: isUniversitiesLoading } = useUniversitiesByRegion(
        educationForm.regionCode || null,
    )
    const { data: universityDetails, isFetching: isUniversityDetailsLoading } = useUniversityDetails(
        educationForm.universityId || null,
    )

    const filteredUniversities = (universities ?? []).filter((item) => {
        const query = universityQuery.trim().toLowerCase()

        if (query === "") {
            return true
        }

        return `${item.name} ${item.shortName ?? ""}`.toLowerCase().includes(query)
    })

    const specialitySuggestions = Array.from(new Set([
        ...(universityDetails?.faculties ?? []).map((item) => item.name),
        ...(universityDetails?.specialities ?? []).map((item) =>
            item.degree ? `${item.code} ${item.name} (${item.degree})` : `${item.code} ${item.name}`,
        ),
    ].filter(Boolean)))

    const update = (id: keyof typeof form, value: string) => {
        updateProfile.reset()
        setShowProfileSuccess(false)
        setForm((prev) => ({ ...prev, [id]: value }))
    }

    const updateEducation = (id: keyof typeof educationForm, value: string) => {
        saveUniversity.reset()
        removeUniversity.reset()
        setShowEducationSuccess(false)
        setEducationForm((prev) => ({ ...prev, [id]: value }))
    }

    const handleRegionChange = (value: string) => {
        saveUniversity.reset()
        removeUniversity.reset()
        setShowEducationSuccess(false)
        setEducationForm((prev) => ({
            ...prev,
            regionCode: value,
            universityId: "",
            specialityName: "",
        }))
        setUniversityQuery("")
    }

    const handleUniversityChange = (value: string) => {
        saveUniversity.reset()
        removeUniversity.reset()
        setShowEducationSuccess(false)
        setEducationForm((prev) => ({
            ...prev,
            universityId: value,
            specialityName: prev.universityId === value ? prev.specialityName : "",
        }))
    }

    // Detect changes
    const hasProfileChanges = JSON.stringify(form) !== JSON.stringify(initialForm)
    const hasEducationChanges = JSON.stringify(educationForm) !== JSON.stringify(initialEducationForm)
    const hasAnyChanges = hasProfileChanges || hasEducationChanges

    const handleSaveAll = () => {
        if (hasProfileChanges) {
            updateProfile.mutate({
                bio: form.bio || null,
                phone: form.phone || null,
                telegram: form.telegram || null,
                city: form.city || null,
                birthDate: form.birthDate || null,
            }, {
                onSuccess: (nextProfile) => {
                    const nextForm = mapProfileToForm(nextProfile)
                    setForm(nextForm)
                    setInitialForm(nextForm)
                    setShowProfileSuccess(true)
                },
            })
        }

        if (hasEducationChanges && educationForm.regionCode && educationForm.universityId && educationForm.course) {
            const nextEducationForm = {
                ...educationForm,
            }
            saveUniversity.mutate({
                universityId: educationForm.universityId,
                regionCode: educationForm.regionCode,
                specialityName: educationForm.specialityName || null,
                groupCode: educationForm.groupCode || null,
                course: Number(educationForm.course),
            }, {
                onSuccess: () => {
                    setEducationForm(nextEducationForm)
                    setInitialEducationForm(nextEducationForm)
                    setInitialUniversityQuery(universityQuery)
                    setShowEducationSuccess(true)
                },
            })
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        uploadAvatar.mutate(file)
        event.target.value = ""
    }

    useEffect(() => {
        if (!showProfileSuccess) return

        const timer = setTimeout(() => setShowProfileSuccess(false), 3000)
        return () => clearTimeout(timer)
    }, [showProfileSuccess])

    useEffect(() => {
        if (!showEducationSuccess) return

        const timer = setTimeout(() => setShowEducationSuccess(false), 3000)
        return () => clearTimeout(timer)
    }, [showEducationSuccess])

    const profileError = updateProfile.isError
        ? extractErrorMessage(updateProfile.error, "Не вдалося зберегти зміни профілю.")
        : null

    const universityError = saveUniversity.isError
        ? extractErrorMessage(saveUniversity.error, "Не вдалося зберегти освітній блок.")
        : removeUniversity.isError
            ? extractErrorMessage(removeUniversity.error, "Не вдалося видалити університет із профілю.")
            : null

    const avatarError = uploadAvatar.isError
        ? extractErrorMessage(uploadAvatar.error, "Не вдалося завантажити аватар.")
        : null

    const currentUniversity = profile?.university ?? null

    const isAnySaving = updateProfile.isPending || saveUniversity.isPending || removeUniversity.isPending
    const canSaveEducation = Boolean(
        educationForm.regionCode &&
        educationForm.universityId &&
        educationForm.course
    )

    const universitySite = universityDetails?.site
        ? universityDetails.site.startsWith("http")
            ? universityDetails.site
            : `https://${universityDetails.site}`
        : null

    return (
        <TabShell
            isDirty={hasAnyChanges}
            isSaving={isAnySaving}
            onSave={handleSaveAll}
            onCancel={() => {
                setForm(initialForm)
                setEducationForm(initialEducationForm)
                setUniversityQuery(initialUniversityQuery)
                setShowProfileSuccess(false)
                setShowEducationSuccess(false)
                updateProfile.reset()
                saveUniversity.reset()
                removeUniversity.reset()
            }}
            canSave={(!(!hasProfileChanges && hasEducationChanges && !canSaveEducation))}
        >
            {/* Avatar and Basic Info */}
                <motion.div variants={itemAnim}>
                    <Card>
                        <CardContent className="flex items-center gap-5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <div className="relative">
                                <Avatar className="size-20">
                                    <AvatarImage src={user?.avatarPath ?? ""} alt={displayName} />
                                    <AvatarFallback className="text-xl">
                                        {uploadAvatar.isPending
                                            ? <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
                                            : initials
                                        }
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={uploadAvatar.isPending}
                                    className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {uploadAvatar.isPending
                                        ? <LoaderCircleIcon className="size-3.5 animate-spin" />
                                        : <CameraIcon className="size-3.5" />
                                    }
                                </button>
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium">{displayName || "Студент"}</p>
                                {user?.username && (
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                )}
                                {profile && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${profile.completion.percent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {profile.completion.percent}% заповнено
                                        </span>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP до 2MB</p>
                                <AnimatePresence>
                                    {avatarError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-1 text-xs text-destructive"
                                        >
                                            {avatarError}
                                        </motion.p>
                                    )}
                                    {uploadAvatar.isSuccess && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-1 text-xs text-green-600"
                                        >
                                            <CheckCircle2Icon className="mr-1 inline size-3" />
                                            Аватар оновлено
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Personal Information */}
                <motion.div variants={itemAnim}>
                    <Card className={hasProfileChanges ? "ring-2 ring-primary/20" : ""}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <SparklesIcon className="size-5 text-primary" />
                                    Особиста інформація
                                </CardTitle>
                                <AnimatePresence>
                                    {hasProfileChanges && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600"
                                        >
                                            <AlertTriangleIcon className="size-3" />
                                            Незбережені зміни
                                        </motion.div>
                                    )}
                                    {showProfileSuccess && !hasProfileChanges && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600"
                                        >
                                            <CheckCircle2Icon className="size-3" />
                                            Збережено
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium">Про себе</label>
                                <textarea
                                    placeholder="Коротко розкажіть про себе, свої інтереси, цілі та стиль навчання."
                                    value={form.bio}
                                    onChange={(event) => update("bio", event.target.value)}
                                    rows={4}
                                    className={textAreaClassName}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Телефон</label>
                                <Input
                                    type="text"
                                    placeholder="+380..."
                                    value={form.phone}
                                    onChange={(event) => update("phone", event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Telegram</label>
                                <Input
                                    type="text"
                                    placeholder="@username"
                                    value={form.telegram}
                                    onChange={(event) => update("telegram", event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Місто</label>
                                <Input
                                    type="text"
                                    placeholder="Київ"
                                    value={form.city}
                                    onChange={(event) => update("city", event.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Дата народження</label>
                                <Input
                                    type="date"
                                    value={form.birthDate}
                                    onChange={(event) => update("birthDate", event.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Education Profile */}
                <motion.div variants={itemAnim}>
                    <Card className={hasEducationChanges ? "ring-2 ring-primary/20" : ""}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <GraduationCapIcon className="size-5 text-primary" />
                                    Освітній профіль
                                </CardTitle>
                                <AnimatePresence>
                                    {hasEducationChanges && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600"
                                        >
                                            <AlertTriangleIcon className="size-3" />
                                            Незбережені зміни
                                        </motion.div>
                                    )}
                                    {showEducationSuccess && !hasEducationChanges && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600"
                                        >
                                            <CheckCircle2Icon className="size-3" />
                                            Збережено
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Регіон</label>
                                <select
                                    value={educationForm.regionCode}
                                    onChange={(event) => handleRegionChange(event.target.value)}
                                    className={selectClassName}
                                >
                                    <option value="">Оберіть регіон</option>
                                    {(profileInformation?.regions ?? []).map((region) => (
                                        <option key={region.value} value={region.value}>
                                            {region.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Курс</label>
                                <select
                                    value={educationForm.course}
                                    onChange={(event) => updateEducation("course", event.target.value)}
                                    className={selectClassName}
                                >
                                    <option value="">Оберіть курс</option>
                                    {(profileInformation?.courses ?? []).map((course) => (
                                        <option key={course.value} value={course.value}>
                                            {course.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium">Пошук університету</label>
                                <Input
                                    type="text"
                                    placeholder={educationForm.regionCode ? "Почніть вводити назву університету" : "Спочатку оберіть регіон"}
                                    value={universityQuery}
                                    onChange={(event) => {
                                        saveUniversity.reset()
                                        removeUniversity.reset()
                                        setShowEducationSuccess(false)
                                        setUniversityQuery(event.target.value)
                                    }}
                                    disabled={!educationForm.regionCode}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium">Університет</label>
                                <select
                                    value={educationForm.universityId}
                                    onChange={(event) => handleUniversityChange(event.target.value)}
                                    className={selectClassName}
                                    disabled={!educationForm.regionCode || isUniversitiesLoading}
                                >
                                    <option value="">
                                        {!educationForm.regionCode
                                            ? "Спочатку оберіть регіон"
                                            : isUniversitiesLoading
                                                ? "Завантаження університетів..."
                                                : "Оберіть університет"}
                                    </option>
                                    {filteredUniversities.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}{item.shortName ? ` (${item.shortName})` : ""}
                                        </option>
                                    ))}
                                </select>
                                {educationForm.regionCode && !isUniversitiesLoading && universities && filteredUniversities.length === 0 && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        У вибраному регіоні не знайдено університетів за вашим запитом.
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium">Факультет / спеціальність</label>
                                <Input
                                    type="text"
                                    placeholder="Наприклад, ФІОТ або 122 Комп'ютерні науки"
                                    value={educationForm.specialityName}
                                    onChange={(event) => updateEducation("specialityName", event.target.value)}
                                    list="profile-speciality-suggestions"
                                    disabled={!educationForm.universityId}
                                />
                                <datalist id="profile-speciality-suggestions">
                                    {specialitySuggestions.map((item) => (
                                        <option key={item} value={item} />
                                    ))}
                                </datalist>
                                {universityDetails && specialitySuggestions.length > 0 && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Підказки підтягнуті з EDBO для вибраного університету.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Група</label>
                                <Input
                                    type="text"
                                    placeholder="ІО-31"
                                    value={educationForm.groupCode}
                                    onChange={(event) => updateEducation("groupCode", event.target.value)}
                                />
                            </div>

                            <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">
                                {currentUniversity ? (
                                    <>
                                        <p className="font-medium text-foreground">Поточний університет</p>
                                        <p className="mt-1 text-muted-foreground">{currentUniversity.name ?? "Університет"}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {currentUniversity.courseLabel ?? "Курс не вказано"}
                                            {currentUniversity.groupCode ? `, група ${currentUniversity.groupCode}` : ""}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-foreground">Університет не вказано</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Додайте інформацію про ваш заклад освіти
                                        </p>
                                    </>
                                )}
                            </div>

                            {(isUniversityDetailsLoading || universityDetails) && (
                                <div className="col-span-2 rounded-xl border bg-muted/30 p-4">
                                    {isUniversityDetailsLoading && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <LoaderCircleIcon className="size-4 animate-spin" />
                                            Завантаження деталей університету...
                                        </div>
                                    )}

                                    {universityDetails && (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <BookOpenIcon className="mt-0.5 size-4 text-primary" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{universityDetails.name}</p>
                                                    {universityDetails.shortName && (
                                                        <p className="text-xs text-muted-foreground">{universityDetails.shortName}</p>
                                                    )}
                                                    {universityDetails.location && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPinIcon className="size-3.5" />
                                                            {universityDetails.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                                                <div>
                                                    <p className="font-medium text-foreground">Тип закладу</p>
                                                    <p>{universityDetails.typeName ?? "Не вказано"}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">Освітніх напрямів</p>
                                                    <p>{universityDetails.specialities.length}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                {universityDetails.address && (
                                                    <span>{universityDetails.address}</span>
                                                )}
                                                {universityDetails.email && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MailIcon className="size-3.5" />
                                                        {universityDetails.email}
                                                    </span>
                                                )}
                                                {universityDetails.phone && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <PhoneIcon className="size-3.5" />
                                                        {universityDetails.phone}
                                                    </span>
                                                )}
                                                {universitySite && (
                                                    <a
                                                        href={universitySite}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary hover:underline"
                                                    >
                                                        <Link2Icon className="size-3.5" />
                                                        Сайт університету
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentUniversity && (
                                <div className="col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => removeUniversity.mutate(undefined, {
                                            onSuccess: () => {
                                                setEducationForm(emptyEducationForm)
                                                setInitialEducationForm(emptyEducationForm)
                                                setUniversityQuery("")
                                                setInitialUniversityQuery("")
                                                setShowEducationSuccess(false)
                                            },
                                        })}
                                        disabled={isAnySaving}
                                    >
                                        {removeUniversity.isPending
                                            ? <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
                                            : <Trash2Icon className="mr-2 size-4" />
                                        }
                                        Видалити університет із профілю
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Error Alerts */}
                <AnimatePresence>
                    {profileError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Alert variant="destructive">
                                <AlertCircleIcon className="size-4" />
                                <AlertDescription>{profileError}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {universityError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Alert variant="destructive">
                                <AlertCircleIcon className="size-4" />
                                <AlertDescription>{universityError}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>
        </TabShell>
    )
}
