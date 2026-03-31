import type { ProfileViewModel, StudentProfile, ProfileUser } from "@/modules/profiles/model/types"

export function getInitials(name: string): string {
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

function normalizeTelegramHandle(value: string | null): string | null {
    if (!value) {
        return null
    }

    return value.replace(/^@/, "")
}

function resolveOnlineStatus(profile: StudentProfile): boolean | null {
    return profile.onlineStatus ?? profile.online_status ?? null
}

export function buildProfileViewModel(
    profile: StudentProfile,
    currentUser: ProfileUser | null,
    isForeignProfile: boolean,
): ProfileViewModel {
    const profileUser = profile.user ?? currentUser
    const userName = [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(" ") || "Студент"
    const avatarUrl = profileUser?.avatarPath ?? profile.profileImage ?? ""
    const about = profile.bio ?? (
        isForeignProfile
            ? "Цей користувач ще не додав опис профілю."
            : "Додайте короткий опис, щоб інші краще розуміли ваш профіль."
    )
    const telegramHandle = normalizeTelegramHandle(profile.telegram)

    return {
        profile,
        isForeignProfile,
        isOwnProfile: !isForeignProfile,
        userName,
        avatarUrl,
        email: profileUser?.email ?? "—",
        about,
        cityLabel: profile.city ?? "—",
        telegramUrl: telegramHandle ? `https://t.me/${telegramHandle}` : null,
        onlineStatus: resolveOnlineStatus(profile),
    }
}
