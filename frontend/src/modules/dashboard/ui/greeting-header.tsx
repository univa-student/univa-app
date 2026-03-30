import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar.tsx";
import type { User } from "@/modules/auth/model/types";

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 5) return "Добраніч";
    if (hour < 12) return "Доброго ранку";
    if (hour < 17) return "Доброго дня";
    if (hour < 21) return "Доброго вечора";

    return "Добраніч";
}

interface Props {
    user: User | null;
}

export function GreetingHeader({ user }: Props) {
    const name = user?.firstName ?? "Студент";
    const initials = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .map((segment) => segment![0])
        .join("")
        .toUpperCase() || "?";

    const today = new Date().toLocaleDateString("uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="size-14 shrink-0 rounded-2xl shadow-lg shadow-primary/10 ring-2 ring-primary/15">
                    {user?.avatarPath ? <AvatarImage src={user.avatarPath} alt={name} /> : null}
                    <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium capitalize text-muted-foreground">{today}</p>
                    <h1 className="mt-0.5 text-2xl font-black tracking-tight text-foreground">
                        {getGreeting()}, <span className="text-primary">{name}</span>
                    </h1>
                </div>
            </div>
        </div>
    );
}
