import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
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
import type { TabDef } from "@/modules/settings/model/settings.types.ts"
import {
    containerAnim,
    itemAnim,
} from "@/modules/settings/ui/settings.animations.ts"

const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
const textAreaClassName = "flex min-h-[112px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

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

    const initials = [user?.firstName?.[0], user?.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ")

    const [form, setForm] = useState({
        bio: "",
        phone: "",
        telegram: "",
        city: "",
        birthDate: "",
    })
    const [educationForm, setEducationForm] = useState({
        regionCode: "",
        universityId: "",
        specialityName: "",
        groupCode: "",
        course: "",
    })
    const [universityQuery, setUniversityQuery] = useState("")

    useEffect(() => {
        if (!profile) return

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            bio: profile.bio ?? "",
            phone: profile.phone ?? "",
            telegram: profile.telegram ?? "",
            city: profile.city ?? "",
            birthDate: profile.birthDate ?? "",
        })

        setEducationForm({
            regionCode: profile.university?.regionCode ?? "",
            universityId: profile.university?.externalId ?? "",
            specialityName: profile.university?.facultyName ?? "",
            groupCode: profile.university?.groupCode ?? "",
            course: profile.university?.course?.toString() ?? "",
        })

        setUniversityQuery(profile.university?.name ?? "")
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
        setForm((prev) => ({ ...prev, [id]: value }))
    }

    const updateEducation = (id: keyof typeof educationForm, value: string) => {
        setEducationForm((prev) => ({ ...prev, [id]: value }))
    }

    const handleSave = () => {
        updateProfile.mutate({
            bio: form.bio || null,
            phone: form.phone || null,
            telegram: form.telegram || null,
            city: form.city || null,
            birthDate: form.birthDate || null,
        })
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

    const handleRegionChange = (value: string) => {
        setEducationForm((prev) => ({
            ...prev,
            regionCode: value,
            universityId: "",
            specialityName: "",
        }))
        setUniversityQuery("")
    }

    const handleUniversityChange = (value: string) => {
        setEducationForm((prev) => ({
            ...prev,
            universityId: value,
            specialityName: prev.universityId === value ? prev.specialityName : "",
        }))
    }

    const handleUniversitySave = () => {
        if (!educationForm.regionCode || !educationForm.universityId || !educationForm.course) {
            return
        }

        saveUniversity.mutate({
            universityId: educationForm.universityId,
            regionCode: educationForm.regionCode,
            specialityName: educationForm.specialityName || null,
            groupCode: educationForm.groupCode || null,
            course: Number(educationForm.course),
        })
    }

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
    const currentEducationSnapshot = {
        regionCode: currentUniversity?.regionCode ?? "",
        universityId: currentUniversity?.externalId ?? "",
        specialityName: currentUniversity?.facultyName ?? "",
        groupCode: currentUniversity?.groupCode ?? "",
        course: currentUniversity?.course?.toString() ?? "",
    }

    const hasEducationChanges =
        educationForm.regionCode !== currentEducationSnapshot.regionCode ||
        educationForm.universityId !== currentEducationSnapshot.universityId ||
        educationForm.specialityName !== currentEducationSnapshot.specialityName ||
        educationForm.groupCode !== currentEducationSnapshot.groupCode ||
        educationForm.course !== currentEducationSnapshot.course

    const isProfileSaving = updateProfile.isPending
    const isEducationSaving = saveUniversity.isPending || removeUniversity.isPending
    const canSaveUniversity = Boolean(
        educationForm.regionCode &&
        educationForm.universityId &&
        educationForm.course &&
        hasEducationChanges,
    )

    const universitySite = universityDetails?.site
        ? universityDetails.site.startsWith("http")
            ? universityDetails.site
            : `https://${universityDetails.site}`
        : null

    return (
        <motion.div className="flex flex-col gap-6" variants={containerAnim} initial="hidden" animate="visible">
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
                                className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {uploadAvatar.isPending
                                    ? <LoaderCircleIcon className="size-3.5 animate-spin" />
                                    : <CameraIcon className="size-3.5" />
                                }
                            </button>
                        </div>

                        <div>
                            <p className="text-sm font-medium">{displayName || "Студент"}</p>
                            {user?.username && (
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                            )}
                            {profile && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Профіль заповнено на {profile.completion.percent}% ({profile.completion.filled}/{profile.completion.total})
                                </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP до 2MB</p>
                            {avatarError && (
                                <p className="mt-1 text-xs text-destructive">{avatarError}</p>
                            )}
                            {uploadAvatar.isSuccess && (
                                <p className="mt-1 text-xs text-green-600">Аватар оновлено.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <SparklesIcon className="size-5 text-primary" />
                            Особиста інформація
                        </CardTitle>
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

            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCapIcon className="size-5 text-primary" />
                            Освітній профіль
                        </CardTitle>
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
                                onChange={(event) => setUniversityQuery(event.target.value)}
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

                        <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                            {currentUniversity ? (
                                <>
                                    <p className="font-medium text-foreground">Збережено у профілі</p>
                                    <p className="mt-1">{currentUniversity.name ?? "Університет"}</p>
                                    <p className="mt-1 text-xs">
                                        {currentUniversity.courseLabel ?? "Курс не вказано"}
                                        {currentUniversity.groupCode ? `, група ${currentUniversity.groupCode}` : ""}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-foreground">Освітній блок ще не заповнений</p>
                                    <p className="mt-1 text-xs">
                                        Після збереження тут буде відображено ваш заклад освіти, курс і групу.
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

                        <div className="col-span-2 flex flex-wrap justify-end gap-3">
                            {currentUniversity && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeUniversity.mutate()}
                                    disabled={isEducationSaving}
                                >
                                    {removeUniversity.isPending
                                        ? <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
                                        : <Trash2Icon className="mr-2 size-4" />
                                    }
                                    Видалити університет
                                </Button>
                            )}

                            <Button
                                type="button"
                                onClick={handleUniversitySave}
                                disabled={!canSaveUniversity || isEducationSaving}
                            >
                                {saveUniversity.isPending && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                                Зберегти освітній блок
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {updateProfile.isSuccess && (
                <Alert variant="default" className="border-green-500/30 bg-green-500/5">
                    <CheckCircle2Icon className="size-4 text-green-500" />
                    <AlertDescription className="text-green-600">Особисту інформацію збережено.</AlertDescription>
                </Alert>
            )}

            {(saveUniversity.isSuccess || removeUniversity.isSuccess) && (
                <Alert variant="default" className="border-green-500/30 bg-green-500/5">
                    <CheckCircle2Icon className="size-4 text-green-500" />
                    <AlertDescription className="text-green-600">
                        {saveUniversity.isSuccess
                            ? "Освітній профіль оновлено."
                            : "Університет видалено з профілю."}
                    </AlertDescription>
                </Alert>
            )}

            {profileError && (
                <Alert variant="destructive">
                    <AlertCircleIcon className="size-4" />
                    <AlertDescription>{profileError}</AlertDescription>
                </Alert>
            )}

            {universityError && (
                <Alert variant="destructive">
                    <AlertCircleIcon className="size-4" />
                    <AlertDescription>{universityError}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isProfileSaving}>
                    {isProfileSaving && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
                    Зберегти зміни профілю
                </Button>
            </div>
        </motion.div>
    )
}
