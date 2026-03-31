import { Link } from "react-router-dom";
import {
    ChevronRightIcon,
    HeartHandshakeIcon,
    MessagesSquareIcon,
    UsersIcon,
} from "lucide-react";
import { useAppFrame } from "@/shared/ui/layouts/app/app-frame";
import { useEffect } from "react";

const HUBS = [
    {
        to: "/dashboard/friends",
        label: "Друзі",
        description: "Список друзів, вхідні запити та пошук нових контактів.",
        icon: HeartHandshakeIcon,
        color: "#3b82f6",
        bg: "bg-blue-500/8",
        iconBg: "bg-blue-500/10",
        iconFg: "text-blue-500",
        hoverBorder: "hover:border-blue-500/25",
    },
    {
        to: "/dashboard/groups",
        label: "Групи",
        description: "Навчальні групи, спільні простори для предметів, розкладу і файлів.",
        icon: UsersIcon,
        color: "#10b981",
        bg: "bg-emerald-500/8",
        iconBg: "bg-emerald-500/10",
        iconFg: "text-emerald-500",
        hoverBorder: "hover:border-emerald-500/25",
    },
    {
        to: "/dashboard/chats",
        label: "Чати",
        description: "Особисті повідомлення та групові обговорення.",
        icon: MessagesSquareIcon,
        color: "#8b5cf6",
        bg: "bg-violet-500/8",
        iconBg: "bg-violet-500/10",
        iconFg: "text-violet-500",
        hoverBorder: "hover:border-violet-500/25",
    },
] as const;

export function CommunityPage() {
    const { setPageTitle } = useAppFrame();

    useEffect(() => {
        setPageTitle("Спільнота");
    }, [setPageTitle]);

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-xl font-bold tracking-tight">Спільнота</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Друзі, групи та чати в одному місці.
                </p>
            </div>

            {/* Hub cards */}
            <div className="flex flex-col gap-3">
                {HUBS.map(({ to, label, description, icon: Icon, iconBg, iconFg, hoverBorder }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`group flex items-center gap-4 rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${hoverBorder}`}
                    >
                        <div
                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconFg} transition-transform group-hover:scale-105`}
                        >
                            <Icon className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                        </div>

                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
