import { format } from "date-fns";
import { uk } from "date-fns/locale";
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
        .map((s) => s![0])
        .join("")
        .toUpperCase() || "?";

    const today = format(new Date(), "EEEE, d MMMM", { locale: uk });

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
                <Avatar className="size-12 shrink-0 rounded-2xl ring-2 ring-primary/15 shadow-sm shadow-primary/10">
                    {user?.avatarPath ? <AvatarImage src={user.avatarPath} alt={name} /> : null}
                    <AvatarFallback className="rounded-2xl bg-primary/10 font-bold text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs capitalize text-muted-foreground">{today}</p>
                    <h1 className="text-xl font-bold tracking-tight">
                        {getGreeting()},{" "}
                        <span className="text-primary">{name}</span>
                    </h1>
                </div>
            </div>
        </div>
    );
}
