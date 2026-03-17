import { PageSidePanel } from "@/shared/ui/page-side-panel";
import { Link, useLocation } from "react-router-dom";
import { Brain, FileText, Sparkles, Layers3 } from "lucide-react";
import { useSummaries } from "@/entities/summary/api/hooks";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Separator } from "@/shared/shadcn/ui/separator";

export function AiPanel() {
    const { pathname } = useLocation();
    const { data: summaries, isLoading } = useSummaries();

    return (
        <PageSidePanel>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 pb-2 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                            <Sparkles className="size-4" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">AI-асистент</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Навігація</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 pt-0 flex-shrink-0 space-y-1">
                    <Link
                        to="/dashboard/ai"
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                            pathname === "/dashboard/ai"
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                    >
                        <Brain className="size-4" />
                        Дашборд AI
                    </Link>
                    <Link
                        to="/dashboard/ai/summaries"
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                            pathname.startsWith("/dashboard/ai/summaries")
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                    >
                        <FileText className="size-4" />
                        Конспекти
                    </Link>
                </div>

                <Separator className="mx-4 w-auto my-2" />

                <div className="p-4 pt-2 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Статистика
                        </p>
                        <Layers3 className="size-3.5 text-muted-foreground/50" />
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Всього конспектів</p>
                        <p className="mt-1 text-xl font-semibold text-foreground">
                            {isLoading ? <Skeleton className="h-7 w-12" /> : (summaries?.length ?? 0)}
                        </p>
                    </div>
                </div>
            </div>
        </PageSidePanel>
    );
}
