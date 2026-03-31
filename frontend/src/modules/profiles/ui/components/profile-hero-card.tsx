import { Building2Icon, MailIcon, MapPinIcon, MessageCircleIcon } from "lucide-react"
import type { ProfileViewModel } from "@/modules/profiles/model/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Badge } from "@/shared/shadcn/ui/badge"
import { Button } from "@/shared/shadcn/ui/button"
import { getInitials } from "@/modules/profiles/lib/view-model"

export function ProfileHeroCard({
    viewModel,
    accentLabel,
}: {
    viewModel: ProfileViewModel
    accentLabel: string
}) {
    const university = viewModel.profile.university

    return (
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-xl">
            {/* Cover gradient */}
            <div className="relative h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            </div>

            <div className="px-6 pb-6">
                {/* Avatar — виходить за межі cover */}
                <div className="relative -mt-14 mb-4 flex items-end justify-between">
                    <div className="relative">
                        <div className="rounded-full bg-gradient-to-br from-primary via-primary/70 to-primary/30 p-[3px] shadow-lg shadow-primary/20">
                            <Avatar className="size-24 border-2 border-card">
                                <AvatarImage src={viewModel.avatarUrl} alt={viewModel.userName} />
                                <AvatarFallback className="bg-muted text-2xl font-bold tracking-tight">
                                    {getInitials(viewModel.userName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {viewModel.onlineStatus !== null && (
                            <span
                                className={`absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-card ${
                                    viewModel.onlineStatus ? "bg-green-500" : "bg-muted-foreground/40"
                                }`}
                            />
                        )}
                    </div>
                </div>

                {/* Name & badges */}
                <div className="mb-5 space-y-1.5">
                    <h1 className="text-xl font-semibold leading-tight tracking-tight">{viewModel.userName}</h1>
                    {viewModel.profile.user?.username && (
                        <p className="text-sm text-muted-foreground">@{viewModel.profile.user.username}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {accentLabel}
                        </Badge>
                        {viewModel.onlineStatus !== null && (
                            <Badge
                                variant={viewModel.onlineStatus ? "default" : "outline"}
                                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            >
                                <span
                                    className={`mr-1.5 inline-block size-1.5 rounded-full ${
                                        viewModel.onlineStatus ? "bg-white" : "bg-muted-foreground"
                                    }`}
                                />
                                {viewModel.onlineStatus ? "Онлайн" : "Офлайн"}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {viewModel.about && (
                    <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{viewModel.about}</p>
                )}

                {/* Info rows */}
                <div className="mb-5 space-y-2">
                    <ProfileInfoRow icon={MailIcon} value={viewModel.email} />
                    {viewModel.cityLabel !== "—" && (
                        <ProfileInfoRow icon={MapPinIcon} value={viewModel.cityLabel} />
                    )}
                    {(university?.shortName ?? university?.name) && (
                        <ProfileInfoRow
                            icon={Building2Icon}
                            value={university?.shortName ?? university?.name ?? ""}
                        />
                    )}
                </div>

                {/* Foreign profile actions */}
                {!viewModel.isOwnProfile && viewModel.telegramUrl && (
                    <Button asChild variant="secondary" className="w-full rounded-xl">
                        <a href={viewModel.telegramUrl} target="_blank" rel="noreferrer">
                            <MessageCircleIcon className="mr-2 size-4" />
                            Написати в Telegram
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )
}

function ProfileInfoRow({
    icon: Icon,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>
    value: string
}) {
    return (
        <div className="flex items-center gap-2.5 text-sm">
            <Icon className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate text-muted-foreground">{value}</span>
        </div>
    )
}
