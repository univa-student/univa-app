import { Link } from "react-router-dom";
import { UsersIcon, MessagesSquareIcon, HeartHandshakeIcon, ChevronRightIcon } from "lucide-react";
import { useAppFrame } from "@/shared/ui/layouts/app/app-frame";
import { useEffect } from "react";

export function CommunityPage() {
    const { setPageTitle } = useAppFrame();

    useEffect(() => {
        setPageTitle("Спільнота");
    }, [setPageTitle]);

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
            <div className="flex flex-col gap-2 px-2 pt-4">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Спільнота</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                    Це ваш єдиний простір для комунікації. Швидкий доступ до керування друзями, пошуку нових контактів, списку навчальних груп та особистих чи групових чатів.
                </p>
            </div>

            {/* The 3 Main blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">

                {/* Friends Card */}
                <Link to="/dashboard/friends" className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
                    <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-500/30">
                        <div className="absolute top-0 right-0 p-6 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                            <div className="flex size-8 rounded-full bg-blue-500/10 items-center justify-center">
                                <ChevronRightIcon className="size-4 text-blue-500" />
                            </div>
                        </div>

                        <div className="size-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
                            <HeartHandshakeIcon className="size-7 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-2 tracking-tight">Друзі</h3>
                        <p className="text-muted-foreground leading-snug text-[13px]">
                            Керуйте списком друзів та переглядайте вхідні запити.
                        </p>
                    </div>
                </Link>

                {/* Groups Card */}
                <Link to="/dashboard/groups" className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
                    <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-emerald-500/30">
                        <div className="absolute top-0 right-0 p-6 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                            <div className="flex size-8 rounded-full bg-emerald-500/10 items-center justify-center">
                                <ChevronRightIcon className="size-4 text-emerald-500" />
                            </div>
                        </div>

                        <div className="size-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
                            <UsersIcon className="size-7 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-2 tracking-tight">Групи</h3>
                        <p className="text-muted-foreground leading-snug text-[13px]">
                            Ваші навчальні групи та спільні робочі простори.
                        </p>
                    </div>
                </Link>

                {/* Chats Card */}
                <Link to="/dashboard/chats" className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
                    <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-violet-500/30">
                        <div className="absolute top-0 right-0 p-6 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                            <div className="flex size-8 rounded-full bg-violet-500/10 items-center justify-center">
                                <ChevronRightIcon className="size-4 text-violet-500" />
                            </div>
                        </div>

                        <div className="size-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
                            <MessagesSquareIcon className="size-7 text-violet-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-2 tracking-tight">Чати</h3>
                        <p className="text-muted-foreground leading-snug text-[13px]">
                            Особисті повідомлення, стрічка подій та обговорення.
                        </p>
                    </div>
                </Link>
            </div>

        </div>
    );
}
