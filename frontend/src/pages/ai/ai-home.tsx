import React from "react";
import { useSummaries } from "@/modules/ai/api/hooks";
import { AiPanel } from "./ai-panel";
import {
    AiHomeHeader,
    AiStats,
    RecentSummaries,
    FeaturedArtifact,
    AiWorkspaces,
    AiStudyMode,
    AiQuickActions
} from "@/modules/ai/ui";

export function AiHome() {
    const { data: summaries, isLoading } = useSummaries();

    const recent = summaries?.slice(0, 3) ?? [];
    const featuredArtifact = recent[0];
    const summaryCount = summaries?.length ?? 0;

    return (
        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <AiPanel />
            <div className="space-y-6">
                <section className="rounded-[28px] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
                    <AiHomeHeader />
                    <AiStats summaryCount={summaryCount} isLoading={isLoading} />
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <RecentSummaries recent={recent} isLoading={isLoading} />
                    <FeaturedArtifact featuredArtifact={featuredArtifact} isLoading={isLoading} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <AiWorkspaces />
                    <section className="space-y-6">
                        <AiStudyMode />
                        <AiQuickActions />
                    </section>
                </div>
            </div>
        </div>
    );
}