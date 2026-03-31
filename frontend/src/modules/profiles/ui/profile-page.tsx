import { useParams } from "react-router-dom"
import { ApiError } from "@/shared/types/api"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { useAuthUser } from "@/modules/auth/model/useAuthUser"
import { useFriendsRealtime } from "@/modules/user/api/hooks"
import {
    useStudentProfile,
    useStudentProfileByUsername,
} from "@/modules/profiles/api/hooks"
import { type ProfileUser } from "@/modules/profiles/model/types"
import { buildProfileViewModel } from "@/modules/profiles/lib/view-model"
import { ProfilePageSkeleton } from "./components/profile-page-skeleton"
import { ProfileErrorState } from "./components/profile-error-state"
import { ProfileDefaultView } from "./profile-default/profile-default-view"
import { ProfileUnivaView } from "./profile-univa/profile-univa-view"

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

    useFriendsRealtime(isForeignProfile)

    const profile = isForeignProfile ? foreignProfileQuery.data : ownProfileQuery.data
    const profileError = isForeignProfile ? foreignProfileQuery.error : ownProfileQuery.error
    const isLoading = isForeignProfile ? foreignProfileQuery.isLoading : ownProfileQuery.isLoading
    const isError = isForeignProfile ? foreignProfileQuery.isError : ownProfileQuery.isError
    const isForbiddenProfile = profileError instanceof ApiError && profileError.isForbidden

    if (isLoading) {
        return <ProfilePageSkeleton />
    }

    if (isError || !profile) {
        return <ProfileErrorState error={profileError} isForbidden={isForbiddenProfile} />
    }

    const viewModel = buildProfileViewModel(
        profile,
        currentUser as ProfileUser | null,
        isForeignProfile,
    )

    if (profile.profileType === "univa") {
        return <ProfileUnivaView viewModel={viewModel} />
    }

    return <ProfileDefaultView viewModel={viewModel} />
}
