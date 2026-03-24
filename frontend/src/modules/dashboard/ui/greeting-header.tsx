import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar.tsx";
import type { User } from "@/modules/auth/model/types";

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 5) return "Добраніч";
    if (h < 12) return "Доброго ранку";
    if (h < 17) return "Доброго дня";
    if (h < 21) return "Доброго вечора";
    return "Добраніч";
}

interface Props {
    user: User | null;
}

export function GreetingHeader({ user }: Props) {
    const name = user?.firstName ?? "Студент";
    const initials = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .map(s => s![0])
        .join("")
        .toUpperCase() || "?";
    const today = new Date().toLocaleDateString("uk-UA", {
        weekday: "long", day: "numeric", month: "long",
    });

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="size-14 rounded-2xl shadow-lg shadow-primary/10 ring-2 ring-primary/15 shrink-0">
                    {user?.avatarPath && <AvatarImage src={user.avatarPath} alt={name} />}
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium text-muted-foreground capitalize">{today}</p>
                    <h1 className="text-2xl font-black tracking-tight mt-0.5">
                        {getGreeting()}, <span className="text-primary">{name}</span> 👋
                    </h1>
                </div>
            </div>
        </div>
    );
}
