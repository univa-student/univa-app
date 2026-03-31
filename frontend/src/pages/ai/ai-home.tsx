import { useNavigate } from "react-router-dom";
import { useSummaries } from "@/modules/ai/api/hooks";
import { AiPanel } from "./ai-panel";
import { AiWorkspaces } from "@/modules/ai/ui/ai-workspaces";
import { RecentSummaries } from "@/modules/ai/ui/recent-summaries";

export function AiHome() {
    const { data: summaries, isLoading } = useSummaries();

    const recent = summaries?.slice(0, 5) ?? [];

    return (
        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <AiPanel />
            <div className="space-y-5">
                <AiHomeHero />

                <AiWorkspaces />

                <RecentSummaries recent={recent} isLoading={isLoading} />
            </div>
        </div>
    );
}

function AiHomeHero() {
    const navigate = useNavigate();

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-border/50 bg-card p-6 shadow-sm">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-6 -top-6 size-36 rounded-full bg-primary/8 blur-3xl" />
                <div className="absolute -right-6 bottom-0 size-28 rounded-full bg-violet-500/6 blur-2xl" />
            </div>

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground">
                        <svg className="size-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        AI-центр
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">
                        ШІ для навчання
                    </h1>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                        Конспекти, пояснення та підготовка до іспитів — на основі твоїх матеріалів.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard/ai/summaries/new")}
                        className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        Новий конспект
                    </button>
                </div>
            </div>
        </div>
    );
}
